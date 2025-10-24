<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\City;
use App\Models\Country;
use App\Models\CustomField;
use App\Models\CustomFieldCategory;
use App\Models\Item;
use App\Models\ItemCustomFieldValue;
use App\Models\ItemImages;
use App\Models\State;
use App\Models\UserFcmToken;
use App\Services\BootstrapTableService;
use App\Services\FileService;
use App\Services\HelperService;
use App\Services\NotificationService;
use App\Services\ResponseService;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Str;
use Throwable;
use Validator;

class ItemController extends Controller {

    public function index() {
        ResponseService::noAnyPermissionThenRedirect(['advertisement-list', 'advertisement-update', 'advertisement-delete']);
        $countries = Country::all();
        $cities = City::all();
        return view('items.index' ,compact('countries','cities'));
    }

    public function show($status , Request $request) {
        try {
            ResponseService::noPermissionThenSendJson('advertisement-list');
            $offset = $request->input('offset', 0);
            $limit = $request->input('limit', 10);
            $sort = $request->input('sort', 'id');
            $order = $request->input('order', 'ASC');
            $sql = Item::with(['custom_fields', 'category:id,name', 'user:id,name', 'gallery_images','featured_items'])->withTrashed();
            if (!empty($request->search)) {
                $sql = $sql->search($request->search);
            }




            if ($status == 'approved') {
                $sql->where('status', 'approved')->getNonExpiredItems()->whereNull('items.deleted_at');
            } elseif ($status == 'requested') {
                $sql->where('status', '!=', 'approved')
                    ->orWhere(function ($query) {
                        $query->where('status', 'approved')
                              ->whereNotNull('expiry_date')
                              ->where('expiry_date', '<', Carbon::now())
                              ->orWhereNotNull('items.deleted_at');
                    });
            }
            if (!empty($request->filter)) {
                $sql = $sql->filter(json_decode($request->filter, false, 512, JSON_THROW_ON_ERROR));
            }

            $total = $sql->count();
            $sql = $sql->sort($sort, $order)->skip($offset)->take($limit);
            $result = $sql->get();
            $bulkData = array();
            $bulkData['total'] = $total;
            $rows = array();

            $itemCustomFieldValues = ItemCustomFieldValue::whereIn('item_id', $result->pluck('id'))->get();
            foreach ($result as $row) {
                /* Merged ItemCustomFieldValue's data to main data */
                $itemCustomFieldValue = $itemCustomFieldValues->filter(function ($data) use ($row) {
                    return $data->item_id == $row->id;
                });
                $featured_status = $row->featured_items->isNotEmpty() ? 'Featured' : 'Premium';
                $row->custom_fields = collect($row->custom_fields)->map(function ($customField) use ($itemCustomFieldValue) {
                    $customField['value'] = $itemCustomFieldValue->first(function ($data) use ($customField) {
                        return $data->custom_field_id == $customField->id;
                    });

                    if ($customField->type == "fileinput" && !empty($customField['value']->value)) {
                        if (!is_array($customField->value)) {
                            $customField['value'] = !empty($customField->value) ? [url(Storage::url($customField->value))] : [];
                        } else {
                            $customField['value'] = null;
                        }
//                        $customField['value']->value = url(Storage::url($customField['value']->value));
                    }
                    return $customField;
                });
                $tempRow = $row->toArray();
                $operate = '';
                if (count($row->custom_fields) > 0 && Auth::user()->can('advertisement-list')) {
                    // View Custom Field
                    $operate .= BootstrapTableService::button('fa fa-eye', '#', ['editdata', 'btn-light-danger  '], ['title' => __("View"), "data-bs-target" => "#editModal", "data-bs-toggle" => "modal",]);
                }

                if ($row->status !== 'sold out' && Auth::user()->can('advertisement-update')) {
                    $operate .= BootstrapTableService::editButton(route('advertisement.approval', $row->id), true, '#editStatusModal', 'edit-status', $row->id);
                }
                  if (Auth::user()->can('advertisement-update')) {
                    $operate .= BootstrapTableService::button('fa fa-wrench', route('advertisement.edit', $row->id), ['btn', 'btn-light-warning'], ['title' => __('Advertisement Update')]);
                }
                if (Auth::user()->can('advertisement-delete')) {
                    $operate .= BootstrapTableService::deleteButton(route('advertisement.destroy', $row->id));
                }
                $tempRow['active_status'] = empty($row->deleted_at);//IF deleted_at is empty then status is true else false
                $tempRow['featured_status'] = $featured_status;
                $tempRow['operate'] = $operate;

                $rows[] = $tempRow;
            }
            $bulkData['rows'] = $rows;
            return response()->json($bulkData);

        } catch (Throwable $th) {
            ResponseService::logErrorResponse($th, "ItemController --> show");
            ResponseService::errorResponse();
        }
    }
    public function updateItemApproval(Request $request, $id) {
        try {
            ResponseService::noPermissionThenSendJson('advertisement-update');
            $item = Item::with('user')->withTrashed()->findOrFail($id);
            $item->update([
                ...$request->all(),
                'rejected_reason' => ($request->status == "soft rejected" || $request->status == "permanent rejected") ? $request->rejected_reason : ''
            ]);
            $user_token = UserFcmToken::where('user_id', $item->user->id)->pluck('fcm_token')->toArray();
            if (!empty($user_token)) {
                NotificationService::sendFcmNotification($user_token, 'About ' . $item->name, "Your Advertisement is " . ucfirst($request->status), "item-update", ['id' => $request->id,]);
            }
            ResponseService::successResponse('Advertisement Status Updated Successfully');
        } catch (Throwable $th) {
            ResponseService::logErrorResponse($th, 'ItemController ->updateItemApproval');
            ResponseService::errorResponse('Something Went Wrong');
        }
    }

    public function destroy($id) {
        ResponseService::noPermissionThenSendJson('advertisement-delete');

        try {
            $item = Item::with('gallery_images')->withTrashed()->findOrFail($id);
            foreach ($item->gallery_images as $gallery_image) {
                FileService::delete($gallery_image->getRawOriginal('image'));
            }
            FileService::delete($item->getRawOriginal('image'));

            $item->forceDelete();

            ResponseService::successResponse('Advertisement deleted successfully');
        } catch (Throwable $th) {
            ResponseService::logErrorResponse($th);
            ResponseService::errorResponse('Something went wrong');
        }
    }
    public function requestedItem() {
        ResponseService::noAnyPermissionThenRedirect(['advertisement-list', 'advertisement-update', 'advertisement-delete']);
        $countries = Country::all();
        $cities = City::all();
        return view('items.requested_item' ,compact('countries','cities'));
    }
    public function searchCities(Request $request)
    {
        $countryName = trim($request->query('country_name'));
        if ($countryName == 'All') {
            return response()->json(['message' => 'Success', 'data' => []]);
        }
        $country = Country::where('name', $countryName)->first();
        if (!$country) {
            return response()->json(['message' => 'Success', 'data' => []]);
        }
        $cities = City::where('country_id', $country->id)->get();
        return response()->json(['message' => 'Success', 'data' => $cities]);
    }
    public function editForm($id)
            {
                $item = Item::with(
                    'user:id,name,email,mobile,profile,country_code',
                    'category.custom_fields', // get custom fields from category
                    'gallery_images:id,image,item_id',
                    'featured_items',
                    'favourites',
                    'item_custom_field_values.custom_field',
                    'area'
                )->findOrFail($id);

                   $categories = Category::whereNull('parent_category_id')
                    ->with([
                        'custom_fields', // level 0
                        'subcategories.custom_fields', // level 1
                        'subcategories.subcategories.custom_fields', // level 2
                        'subcategories.subcategories.subcategories.custom_fields', // level 3
                        'subcategories.subcategories.subcategories.subcategories.custom_fields', // level 4 (optional)
                    ])
                    ->get();


                    $customFieldCategories = CustomFieldCategory::with('custom_fields')
                    ->where('category_id', $item->category_id)
                    ->get();

                    // Get saved custom field values for this item
                    $savedValues = ItemCustomFieldValue::where('item_id', $item->id)->get()->keyBy('custom_field_id');


                    // Build the custom fields array with values
                $custom_fields = $customFieldCategories->map(function ($relation) use ($savedValues) {
            $field = $relation->custom_fields;
            if (!$field) return null;

            $value = $savedValues->get($field->id)->value ?? null;

            if ($field->type === 'fileinput') {
                $field->value = $value ? [url(Storage::url($value))] : [];
            } else {
                if (is_array($value)) {
                    if (in_array($field->type, ['textbox', 'number'])) {
                        $field->value = implode(', ', $value);
                    } else {
                        $field->value = $value;
                    }
                } elseif (is_string($value)) {
                    $decodedValue = json_decode($value, true);
                    if (is_array($decodedValue)) {
                        if (in_array($field->type, ['textbox', 'number'])) {
                            $field->value = implode(', ', $decodedValue);
                        } else {
                            $field->value = $decodedValue;
                        }
                    } else {
                        $field->value = $decodedValue ?? $value;
                    }
                } else {
                    $field->value = '';
                }
            }

        // Fix for dropdown and radio: ensure $field->value is string
        if (in_array($field->type, ['dropdown', 'radio'])) {
            if (is_array($field->value)) {
                $field->value = count($field->value) > 0 ? (string)$field->value[0] : '';
            } elseif (is_object($field->value)) {
                $field->value = '';
            }
        }

        return $field;
    })->filter();
                $countries = Country::all();
                    $states = State::get();
                    $cities = city::get();
                $selected_category = [$item->category_id];
                return view('items.update', compact('item', 'categories', 'custom_fields', 'selected_category','countries','states','cities'));
        }

    public function update(Request $request, $id)
      {
        ResponseService::noPermissionThenSendJson('advertisement-update');
        // Validate input
        $validator = Validator::make($request->all(), [
            'name'                 => 'required|string|max:255',
            'slug'                 => 'nullable|regex:/^[a-z0-9-]+$/',
            'price'                => 'required|numeric|min:0',
            'description'          => 'nullable|string',
            'latitude'             => 'nullable',
            'longitude'            => 'nullable',
            'address'              => 'nullable',
            'contact'              => 'nullable',
            'image'                => 'nullable|mimes:jpeg,jpg,png|max:7168',
            'custom_fields'        => 'nullable',
            'custom_field_files'   => 'nullable|array',
            'custom_field_files.*' => 'nullable|mimes:jpeg,png,jpg,pdf,doc|max:7168',
            'gallery_images'       => 'nullable|array',
            'admin_edit_reason'    => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        DB::beginTransaction();
        try {
            $item = Item::findOrFail($id);

            $category = Category::findOrFail($request->category_id);
                $isJobCategory = $category->is_job_category;
                $isPriceOptional = $category->price_optional;

                if ($isJobCategory || $isPriceOptional) {
                    $validator = Validator::make($request->all(), [
                        'min_salary' => 'nullable|numeric|min:0',
                        'max_salary' => 'nullable|numeric|gte:min_salary',
                    ]);
                } else {
                    $validator = Validator::make($request->all(), [
                        'price' => 'required|numeric|min:0',
                    ]);
                }

           $customFieldCategories = CustomFieldCategory::with('custom_fields')
                ->where('category_id', $request->category_id)
                ->get();

            $customFieldErrors = [];
            foreach ($customFieldCategories as $relation) {
                $field = $relation->custom_fields;
                if (empty($field) || $field->required != 1) continue;
                $fieldId = $field->id;
                $fieldLabel = $field->name;

                if (in_array($field->type, ['textbox', 'number', 'dropdown', 'radio'])) {
                    if (empty($request->input("custom_fields.$fieldId"))) {
                        $customFieldErrors["custom_fields.$fieldId"] = "The $fieldLabel field is required.";
                    }
                }

                if ($field->type === 'checkbox') {
                    if (!is_array($request->input("custom_fields.$fieldId")) || empty($request->input("custom_fields.$fieldId"))) {
                        $customFieldErrors["custom_fields.$fieldId"] = "The $fieldLabel field is required.";
                    }
                }

                if ($field->type === 'fileinput') {
                    $existing = ItemCustomFieldValue::where([
                        'item_id' => $id,
                        'custom_field_id' => $fieldId
                    ])->first();

                    if (!$request->hasFile("custom_field_files.$fieldId") && empty($existing?->value)) {
                        $customFieldErrors["custom_field_files.$fieldId"] = "The $fieldLabel file is required.";
                    }
                }
            }
            if (!empty($customFieldErrors)) {
                return back()->withErrors($customFieldErrors)->withInput();
            }

            $data = array_merge($request->all(), [
                'is_edited_by_admin' => 1,
                'admin_edit_reason' => $request->admin_edit_reason,
            ]);

            // $data['slug'] = $uniqueSlug;
           $manualAddress = $request->input('manual_address');

            if ($manualAddress) {
                $data['address'] = $manualAddress;
                $city = City::find($request->city);
                $state = State::find($request->state);
                $country = Country::find($request->country);

                $data['country']   = $country?->name ?? $request->country;
                $data['state']     = $state?->name ?? $request->state;
                $data['city']      = $city?->name ?? $request->city;
                $data['latitude']  = $city?->latitude ?? null;
                $data['longitude'] = $city?->longitude ?? null;
            } else {
                $data['address'] = $request->input('address_input');
                $data['country'] = $request->input('country_input');
                $data['state']   = $request->input('state_input');
                $data['city']    = $request->input('city_input');
                $data['latitude'] = $request->input('latitude');
                $data['longitude'] = $request->input('longitude');
            }
            // Handle main image
            if ($request->hasFile('image')) {
                $data['image'] = FileService::compressAndReplace($request->file('image'), 'uploads/items', $item->getRawOriginal('image'));
            }

            // Update item
                 $item->update($data);

                if ($request->custom_fields) {
                    $itemCustomFieldValues = [];
                    foreach ($request->custom_fields  as $key => $custom_field) {
                      $value = is_array($custom_field) ? $custom_field : [$custom_field];

                        $itemCustomFieldValues[] = [
                            'item_id'         => $item->id,
                            'custom_field_id' => $key,
                            'value'           => json_encode($value, JSON_THROW_ON_ERROR), // ✅ encode to string
                            'updated_at'      => now()
                        ];
                    }
                    if (!empty($itemCustomFieldValues)) {
                        ItemCustomFieldValue::upsert($itemCustomFieldValues, ['item_id', 'custom_field_id'], ['value', 'updated_at']);
                    }
                }
                if ($request->hasFile('custom_field_files')) {
                    $itemCustomFieldValues = [];
                    foreach ($request->file('custom_field_files') as $key => $file) {
                        $value = ItemCustomFieldValue::where(['item_id' => $item->id, 'custom_field_id' => $key])->first();

                        $path = $value
                            ? FileService::replace($file, 'custom_fields_files', $value->getRawOriginal('value'))
                            : FileService::upload($file, 'custom_fields_files');

                        $itemCustomFieldValues[] = [
                            'item_id'         => $item->id,
                            'custom_field_id' => $key,
                            'value'           => $path,
                            'updated_at'      => now()
                        ];
                    }

                    if (!empty($itemCustomFieldValues)) {
                        ItemCustomFieldValue::upsert($itemCustomFieldValues, ['item_id', 'custom_field_id'], ['value', 'updated_at']);
                    }
                }


            // Add gallery images
            if ($request->hasFile('gallery_images')) {
                $galleryImages = [];
                foreach ($request->file('gallery_images') as $file) {
                    $galleryImages[] = [
                        'image'      => FileService::compressAndUpload($file, 'uploads/items'),
                        'item_id'    => $item->id,
                        'created_at' => time(),
                        'updated_at' => time(),
                    ];
                }
                if (count($galleryImages) > 0) {
                    ItemImages::insert($galleryImages);
                }
            }

            // Custom field files
           foreach ($request->allFiles() as $key => $file) {
                if (Str::startsWith($key, 'custom_fields.')) {
                    $customFieldId = Str::after($key, 'custom_fields.');
                    $value = ItemCustomFieldValue::where(['item_id' => $item->id, 'custom_field_id' => $customFieldId])->first();

                    if ($value) {
                        $filePath = FileService::replace($file, 'custom_fields_files', $value->getRawOriginal('value'));
                    } else {
                        $filePath = FileService::upload($file, 'custom_fields_files');
                    }

                    ItemCustomFieldValue::updateOrCreate(
                        ['item_id' => $item->id, 'custom_field_id' => $customFieldId],
                        ['value' => $filePath, 'updated_at' => now()]
                    );
                }
            }

            // Delete gallery images if needed
            if (!empty($request->delete_item_image_id)) {
                $itemImageIds = explode(',', $request->delete_item_image_id);
                foreach (ItemImages::whereIn('id', $itemImageIds)->get() as $itemImage) {
                    FileService::delete($itemImage->getRawOriginal('image'));
                    $itemImage->delete();
                }
            }

            DB::commit();
            $isApproved = $item->status === 'approved';
            $isNonExpired = $item->expired_at === null || $item->expired_at > now();
            $isNotDeleted = $item->deleted_at === null;
            $user_token = UserFcmToken::where('user_id', $item->user->id)->pluck('fcm_token')->toArray();
            if (!empty($user_token)) {
                NotificationService::sendFcmNotification($user_token, 'About ' . $item->name, "Your Advertisement is edited by admin" ,"item-edit", ['id' => $request->id,]);
            }

            if ($isApproved && $isNonExpired && $isNotDeleted) {
                 ResponseService::successRedirectResponse("Advertisement Updated Successfully", route('advertisement.index'));
            } else {
                 ResponseService::successRedirectResponse("Advertisement Updated Successfully", route('advertisement.requested.index'));
            }
        } catch (Throwable $th) {
            DB::rollBack();
            report($th);
            return redirect()->back()->with('error', 'An error occurred while updating the item.');
        }
    }
        public function getCustomFields($categoryId)
        {
            $fields = $this->getFieldsRecursively($categoryId);
            $category = Category::findOrFail($categoryId);

            return response()->json(['fields' => $fields,
            'is_job_category' => $category->is_job_category,
            'price_optional' => $category->price_optional,
        ]);
        }
        protected function getFieldsRecursively($categoryId)
        {
            $customFieldCategories = CustomFieldCategory::with('custom_fields')
                ->where('category_id', $categoryId)
                ->get();

              $fields = $customFieldCategories->map(function ($relation) {
            return $relation->custom_fields; // it's a single object per category
                })->filter()->values();

            if ($fields) {
                return $fields;
            }

            $category = Category::find($categoryId);

            if ($category && $category->parent_category_id) {
                return $this->getFieldsRecursively($category->parent_category_id);
            }
            return collect();
        }




}
