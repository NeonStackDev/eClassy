<?php

use App\Http\Controllers\ApiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

/* Authenticated Routes */

Route::group(['middleware' => ['auth:sanctum']], static function () {
    Route::get('get-package', [ApiController::class, 'getPackage']);
    Route::post('update-profile', [ApiController::class, 'updateProfile']);
    Route::delete('delete-user', [ApiController::class, 'deleteUser']);

    Route::get('my-items', [ApiController::class, 'getItem']);
    Route::post('add-item', [ApiController::class, 'addItem']);
    Route::post('update-item', [ApiController::class, 'updateItem']);
    Route::post('delete-item', [ApiController::class, 'deleteItem']);
    Route::post('update-item-status', [ApiController::class, 'updateItemStatus']);
    Route::get('item-buyer-list', [ApiController::class, 'getItemBuyerList']);

    Route::post('renew-item', [ApiController::class, 'renewItem']);

    Route::post('assign-free-package', [ApiController::class, 'assignFreePackage']);
    Route::post('make-item-featured', [ApiController::class, 'makeFeaturedItem']);
    Route::post('manage-favourite', [ApiController::class, 'manageFavourite']);
    Route::post('add-reports', [ApiController::class, 'addReports']);
    Route::get('get-notification-list', [ApiController::class, 'getNotificationList']);
    Route::get('get-limits', [ApiController::class, 'getLimits']);
    Route::get('get-favourite-item', [ApiController::class, 'getFavouriteItem']);

    Route::get('get-payment-settings', [ApiController::class, 'getPaymentSettings']);
    Route::post('payment-intent', [ApiController::class, 'getPaymentIntent']);
    Route::get('payment-transactions', [ApiController::class, 'getPaymentTransactions']);

    /*Chat Module*/
    Route::post('item-offer', [ApiController::class, 'createItemOffer']);
    Route::post('item-order', [ApiController::class, 'createItemOrder']);
    Route::get('chat-list', [ApiController::class, 'getChatList']);
    Route::post('send-message', [ApiController::class, 'sendMessage']);
    Route::get('chat-messages', [ApiController::class, 'getChatMessages']);

    Route::post('in-app-purchase', [ApiController::class, 'inAppPurchase']);

    Route::post('block-user', [ApiController::class, 'blockUser']);
    Route::post('unblock-user', [ApiController::class, 'unblockUser']);
    Route::get('blocked-users', [ApiController::class, 'getBlockedUsers']);

    Route::post('add-item-review', [ApiController::class, 'addItemReview']);
    Route::get('my-review', [ApiController::class, 'getMyReview']);
    Route::post('add-review-report', [ApiController::class, 'addReviewReport']);

    Route::get('verification-fields', [ApiController::class, 'getVerificationFields']);
    Route::post('send-verification-request', [ApiController::class, 'sendVerificationRequest']);
    Route::get('verification-request', [ApiController::class, 'getVerificationRequest']);
    Route::post('bank-transfer-update', [ApiController::class, 'bankTransferUpdate']);

    Route::post('job-apply', [ApiController::class, 'applyJob']);
    Route::get('get-job-applications', [ApiController::class, 'recruiterApplications']);
    Route::get('my-job-applications', [ApiController::class, 'myJobApplications']);
    Route::post('update-job-applications-status', [ApiController::class, 'updateJobStatus']);

    //Wallet Route
    Route::get('get-wallet', [ApiController::class, 'getWallet']);
    Route::get('get-wallet-transaction', [ApiController::class, 'getWalletTransaction']);
    Route::post('wallet-deposit', [ApiController::class, 'requestDepost']);
    Route::post('wallet-withdraw', [ApiController::class, 'requestWithdraw']);
    Route::get('get-balance', [ApiController::class, 'getBalance']);


    //Order Route
    Route::get('get-received-order', [ApiController::class, 'getReceivedOrder']);
    Route::get('get-request-order', [ApiController::class, 'getRequestOrder']);
    Route::post('accept-order', [ApiController::class, 'acceptOrder']);
    Route::post('reject-order', [ApiController::class, 'rejectOrder']);
    Route::post('delivery-order', [ApiController::class, 'deliveryOrder']);
    Route::post('ship-order', [ApiController::class, 'shipOrder']);
    Route::post('approve-order', [ApiController::class, 'approveOrder']);
    Route::post('dispute-order', [ApiController::class, 'disputeOrder']);
    Route::post('approve-milestone', [ApiController::class, 'approveMilestone']);
    Route::post('get-dispute-fee', [ApiController::class, 'getDisputeFee']);
    Route::post('pay-dispute-fee', [ApiController::class, 'payDisputeFee']);
    Route::get('get-disputes', [ApiController::class, 'getDisputes']);
    Route::get('get-dispute-content', [ApiController::class, 'getDisputeContent']);
    Route::post('post-dispute-content', [ApiController::class, 'postDisputeContent']);

    
});


/* Non Authenticated Routes */
Route::get('get-otp', [ApiController::class, 'getOtp']);
Route::get('verify-otp', [ApiController::class, 'verifyOtp']);
Route::get('get-package', [ApiController::class, 'getPackage']);
Route::get('get-languages', [ApiController::class, 'getLanguages']);
Route::post('user-signup', [ApiController::class, 'userSignup']);
Route::post('set-item-total-click', [ApiController::class, 'setItemTotalClick']);
Route::get('get-system-settings', [ApiController::class, 'getSystemSettings']);
Route::get('app-payment-status', [ApiController::class, 'appPaymentStatus']);
Route::get('get-customfields', [ApiController::class, 'getCustomFields']);
Route::get('get-item', [ApiController::class, 'getItem']);
Route::get('get-slider', [ApiController::class, 'getSlider']);
Route::get('get-report-reasons', [ApiController::class, 'getReportReasons']);
Route::get('get-categories', [ApiController::class, 'getSubCategories']);
Route::get('get-parent-categories', [ApiController::class, 'getParentCategoryTree']);
Route::get('get-featured-section', [ApiController::class, 'getFeaturedSection']);
Route::get('blogs', [ApiController::class, 'getBlog']);
Route::get('blog-tags', [ApiController::class, 'getAllBlogTags']);
Route::get('faq', [ApiController::class, 'getFaqs']);
Route::get('tips', [ApiController::class, 'getTips']);
Route::get('countries', [ApiController::class, 'getCountries']);
Route::get('states', [ApiController::class, 'getStates']);
Route::get('cities', [ApiController::class, 'getCities']);
Route::get('areas', [ApiController::class, 'getAreas']);
Route::post('contact-us', [ApiController::class, 'storeContactUs']);
Route::get('seo-settings', [ApiController::class, 'seoSettings']);
Route::get('get-seller', [ApiController::class, 'getSeller']);
Route::get('get-categories-demo', [ApiController::class, 'getCategories']);
Route::get('get-location', [ApiController::class, 'getLocationFromCoordinates']);
Route::get('get-commission', [ApiController::class, 'getCommission']);
 //PayFast Route
Route::post('/payfast-notify', [ApiController::class, 'payfastNotify']);