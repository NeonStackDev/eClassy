<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Wallet;
use App\Models\Dispute;
use App\Models\WalletTransaction;
use App\Services\ResponseService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Throwable;

class OrderController extends Controller
{

    private string $uploadFolder;

    public function __construct()
    {
        $this->uploadFolder = 'packages';
    }

    public function index()
    {
        ResponseService::noAnyPermissionThenRedirect(['advertisement-listing-package-list', 'advertisement-listing-package-create', 'advertisement-listing-package-update', 'advertisement-listing-package-delete']);

        return view('orders.index');
    }

    public function ordersShow(Request $request)
    {
        ResponseService::noAnyPermissionThenRedirect(['advertisement-listing-package-list', 'advertisement-listing-package-create', 'advertisement-listing-package-update', 'advertisement-listing-package-delete']);
        ResponseService::noPermissionThenSendJson('user-package-list');
        $offset = $request->offset ?? 0;
        $limit = $request->limit ?? 10;
        $sort = $request->sort ?? 'id';
        $order = $request->order ?? 'DESC';

        $sql = Order::with('seller:id,name', 'buyer:id,name', 'item:id,name');
        if (!empty($request->search)) {
            $sql = $sql->search($request->search);
        }
        if (!empty($request->filter)) {
            $sql = $sql->filter(json_decode($request->filter, false, 512, JSON_THROW_ON_ERROR));
        }
        $total = $sql->count();
        $sql->orderBy($sort, $order)->skip($offset)->take($limit);
        $result = $sql->get();
        $bulkData = array();
        $bulkData['total'] = $total;
        $rows = array();
        foreach ($result as $key => $row) {
            $tempRow = $row->toArray();
            $tempRow['created_at'] = Carbon::createFromFormat('Y-m-d H:i:s', $row->created_at)->format('d-m-y H:i:s');
            $rows[] = $tempRow;
        }
        $bulkData['rows'] = $rows;
        return response()->json($bulkData);
    }

    public function ordersDisputed()
    {
        ResponseService::noAnyPermissionThenRedirect(['advertisement-listing-package-list', 'advertisement-listing-package-create', 'advertisement-listing-package-update', 'advertisement-listing-package-delete']);

        return view('orders.disput');
    }

    public function ordersDisputedShow(Request $request)
    {
        ResponseService::noAnyPermissionThenRedirect(['advertisement-listing-package-list', 'advertisement-listing-package-create', 'advertisement-listing-package-update', 'advertisement-listing-package-delete']);
        ResponseService::noPermissionThenSendJson('user-package-list');
        $offset = $request->offset ?? 0;
        $limit = $request->limit ?? 10;
        $sort = $request->sort ?? 'id';
        $order = $request->order ?? 'DESC';

        $sql = Dispute::with([
            'user:id,name',
            'order:id,buyer_id,seller_id',
            'order.buyer:id,name',
            'order.seller:id,name',
            'order.item:id,name',
        ]);

        if (!empty($request->search)) {
            $sql = $sql->search($request->search);
        }
        if (!empty($request->filter)) {
            $sql = $sql->filter(json_decode($request->filter, false, 512, JSON_THROW_ON_ERROR));
        }
        $total = $sql->count();
        $sql->orderBy($sort, $order)->skip($offset)->take($limit);
        $result = $sql->get();
        $result = $result->map(function ($dispute) {
            $order = $dispute->order;
            if (!$order) return $dispute;
            $userId = $dispute->user_id;
            // Determine who to show (the opposite person)
            $dispute->opponent_name = $userId == $order->buyer_id
                ? ($order->seller->name ?? '—')
                : ($order->buyer->name ?? '—');

            return $dispute;
        });
        $bulkData = array();
        $bulkData['total'] = $total;
        $rows = array();
        foreach ($result as $key => $row) {
            $tempRow = $row->toArray();
            $tempRow['proof'] = Storage::url($tempRow['proof']);
            $tempRow['created_at'] = Carbon::createFromFormat('Y-m-d H:i:s', $row->created_at)->format('d-m-y H:i:s');
            $rows[] = $tempRow;
        }
        $bulkData['rows'] = $rows;
        // dd($bulkData['rows']);
        return response()->json($bulkData);
    }

    public function transactionApprove(Request $request, $id)
    {

        ResponseService::noPermissionThenSendJson('wallet-history-update');
        try {
            $disput = Dispute::findOrFail($id);
            $disput->payment_status = 'paid';
            $disput->save();

            $wallet = Wallet::where('user_id', $disput->user_id)->first();
               if(!$wallet) return ResponseService::errorResponse('Wallet not found');
            $wallet->balance -= 100;
            if ($wallet->balance < 0) {
                return ResponseService::errorResponse('Insufficient balance');
            }
            $wallet->save();
            return response()->json(['data' => $disput, 'success' => true, 'message' => 'Approve Successful']);
        } catch (Throwable $th) {
            ResponseService::logErrorResponse($th, "PackageController ->  update");
            ResponseService::errorResponse();
        }
    }


    public function transactionReject(Request $request, $id)
    {

        ResponseService::noPermissionThenSendJson('wallet-history-update');
        try {
            $disput = Dispute::findOrFail($id);
            $disput->payment_status = 'rejected';
            $disput->save();            
            return response()->json(['data' => $disput, 'success' => true, 'message' => 'Approve Successful']);
        } catch (Throwable $th) {
            ResponseService::logErrorResponse($th, "PackageController ->  update");
            ResponseService::errorResponse();
        }
    }
}
