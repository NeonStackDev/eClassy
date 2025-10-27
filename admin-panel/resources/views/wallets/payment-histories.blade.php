@extends('layouts.main')

@section('title')
{{ __('Payment Histories') }}
@endsection

@section('page-title')
<div class="page-title">
    <div class="row">
        <div class="col-12 col-md-6 order-md-1 order-last">
            <h4>@yield('title')</h4>
        </div>
        <div class="col-12 col-md-6 order-md-2 order-first"></div>
    </div>
</div>
@endsection

@section('content')
<section class="section">
    <div class="card">
        <div class="card-body">
            <div class="row">
                <div class="col-12">
                    <div id="filters" class="d-flex flex-wrap align-items-end gap-2">
                        <div class="col-md-3">
                            <label for="filter_type">{{__("Type")}}</label>
                            <select class="form-control bootstrap-table-filter-control-type" id="filter_type">
                                <option value="">{{__("All")}}</option>
                                <option value="deposit">{{__("Deposit")}}</option>
                                <option value="withdrawal">{{__("Withdrawal")}}</option>
                                <option value="escrow_fund">{{__("Escrow Fund")}}</option>
                                <option value="escrow_release">{{__("Escrow Release")}}</option>
                                <option value="refund">{{__("Refund")}}</option>
                                <option value="admin_adjustment">{{__("Admin Adjustment")}}</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label for="filter_mode">{{ __("Mode") }}</label>
                            <select class="form-control bootstrap-table-filter-control-mode" id="filter_mode">
                                <option value="">{{ __("All") }}</option>
                                <option value="manual">{{ __("Manual") }}</option>
                                <option value="auto">{{ __("Auto") }}</option>
                            </select>
                        </div>

                        <div class="col-md-3">
                            <label for="filter_status">{{__("Status")}}</label>
                            <select class="form-control bootstrap-table-filter-control-status" id="filter_status">
                                <option value="">{{__("All")}}</option>
                                <option value="pending">{{__("Pending")}}</option>
                                <option value="approved">{{__("Approved")}}</option>
                                <option value="rejected">{{__("Rejected")}}</option>
                            </select>
                        </div>


                    </div>
                    <table class="table-borderless table-striped" aria-describedby="mydesc" id="table_list"
                        data-toggle="table" data-url="{{ route('wallet.payment-histories.show','requested') }}" data-click-to-select="true"
                        data-side-pagination="server" data-pagination="true"
                        data-page-list="[5, 10, 20, 50, 100, 200]" data-search="true"
                        data-show-columns="true" data-show-refresh="true" data-fixed-columns="true"
                        data-fixed-number="1" data-fixed-right-number="1" data-trim-on-search="false"
                        data-escape="true"
                        data-responsive="true" data-sort-name="id" data-sort-order="desc"
                        data-pagination-successively-size="3" data-table="items" data-status-column="deleted_at"
                        data-show-export="true" data-export-options='{"fileName": "item-list","ignoreColumn": ["operate"]}' data-export-types="['pdf','json', 'xml', 'csv', 'txt', 'sql', 'doc', 'excel']"
                        data-mobile-responsive="true" data-filter-control="true" data-filter-control-container="#filters" data-toolbar="#filters">
                        <thead class="thead-dark">
                            <tr>
                                <th scope="col" data-field="id" data-sortable="true">{{ __('ID') }}</th>
                                <th scope="col" data-field="created_at" data-align="center" data-sortable="true">{{ __('Date') }}</th>
                                <th scope="col" data-field="wallet.user.name" data-sort-name="user_name" data-sortable="true">{{ __('User') }}</th>
                                <th scope="col" data-field="type" data-sort-name="type" data-sortable="true">{{ __('Type') }}</th>
                                <th scope="col" data-field="method" data-sort-name="method" data-sortable="true">{{ __('Method') }}</th>
                                <th scope="col" data-field="mode" data-sort-name="mode" data-sortable="true">{{ __('Mode') }}</th>
                                <th scope="col" data-field="amount" data-sortable="true">{{ __('Price') }}</th>
                                <th scope="col" data-field="fee" data-sortable="true">{{ __('Fee') }}</th>
                                <th scope="col" data-field="proof_url" data-sortable="false" data-escape="false" data-formatter="imageFormatter">{{ __('Image') }}</th>
                                <th scope="col" data-field="status" data-sortable="true" data-visible="true" data-formatter="statusFormatter">{{ __('Status') }}</th>
                                @canany(['wallet-history-update'])
                                <th scope="col" data-field="operate" data-align="center" data-sortable="false" data-formatter="actionFormatter" data-events="actionEvents" data-escape="false">{{ __('Action') }}</th>
                                @endcanany
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>
        </div>
    </div>

</section>
@endsection
@section('script')
<script>
    function updateApprovalSuccess() {
        $('#editStatusModal').modal('hide');
    }

    function statusFormatter(value, row, index) {
        switch (value) {
            case 'pending':
                return '<span class="badge bg-warning text-dark">Pending</span>';
            case 'approved':
                return '<span class="badge bg-success">Approved</span>';
            case 'rejected':
                return '<span class="badge bg-danger">Rejected</span>';
            case 'failed':
                return '<span class="badge bg-secondary">Failed</span>';
            default:
                return `<span class="badge bg-info">${value}</span>`;
        }
    }

    function actionFormatter(value, row, index) {
        if (row.status == 'pending')
            return `<button class="btn btn-success btn-sm me-1" data-action="approve">Approve</button>
            <button class="btn btn-danger btn-sm" data-action="reject">Reject</button>`;
    }

    window.actionEvents = {
        'click button': function(e, value, row, index) {
            const action = e.currentTarget.getAttribute('data-action');
            if (action === 'approve') {
                // call your approve function
                approveTransaction(row.id);
            } else if (action === 'reject') {
                // call your reject function
                rejectTransaction(row.id);
            }
        }
    };

    // Example functions
    function approveTransaction(id) {
        // Make API call to approve
        fetch(`/wallet/transactions/${id}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                showSuccessToast('Transaction approved!');                
                $('table').bootstrapTable('refresh'); // refresh table
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Something went wrong.');
            });

    }

    function rejectTransaction(id) {
        // Make API call to reject
        fetch(`/wallet/transactions/${id}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                showSuccessToast('Transaction rejected!');                
                $('table').bootstrapTable('refresh'); // refresh table
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Something went wrong.');
            });
    }
</script>
@endsection