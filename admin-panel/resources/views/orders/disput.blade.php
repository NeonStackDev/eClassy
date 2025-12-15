@extends('layouts.main')

@section('title')
{{ __('Order Management') }}
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
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <div class="card-body">

                    {{-- <div class="row " id="toolbar"> --}}

                    <div class="row">
                        <div class="col-12">

                            <table class="table-borderless table-striped" aria-describedby="mydesc" id="table_list"
                                data-toggle="table" data-url="{{ route('order.disputed.show') }}" data-click-to-select="true"
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
                                        <th scope="col" data-field="id" data-align="center" data-sortable="true">{{ __('ID') }}</th>
                                        <th scope="col" data-field="order.id" data-align="center" data-sortable="true">{{ __('Order Id') }}</th>
                                        <th scope="col" data-field="user.name" data-align="center" data-sortable="true">{{ __('User Name') }}</th>
                                        <th scope="col" data-field="opponent_name" data-align="center" data-sortable="true">{{ __('Disput Name') }}</th>
                                        <th scope="col" data-field="status" data-align="center" data-formatter="statusFormatter" data-sortable="true">{{ __('Status') }}</th>
                                        <th scope="col" data-field="created_at" data-align="center">{{ __('Date') }}</th>
                                        <th scope="col" data-field="payment_status" data-formatter="paymentStatusFormatter" data-align="center" data-sortable="true">{{ __('Payment Status') }}</th>
                                        <th scope="col" data-field="proof" data-align="center" data-formatter="imageFormatter" data-sortable="true">{{ __('Proof') }}</th>
                                        <th scope="col" data-field="action" data-align="center" data-formatter="actionFormatter" data-events="actionEvents" data-escape="false">{{ __('Action') }}</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="viewDetailModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel1"
        aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="myModalLabel1">{{ __('Dispute Contents') }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="center" id="custom_fields"></div>
                </div>
            </div>
        </div>

    </div>
    @endsection

    @section('script')
    <script>
        function updateApprovalSuccess() {
            $('#editStatusModal').modal('hide');
        }

        function approveTransaction(id) {
            // Make API call to approve
            fetch(`/order/transactions/${id}/approve`, {
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
            fetch(`/order/transactions/${id}/reject`, {
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

        function statusFormatter(value, row, index) {
            switch (value) {
                case 'processing':
                    return '<span class="badge bg-warning text-dark">Processing</span>';
                case 'delivered':
                    return '<span class="badge bg-warning text-dark">Delivered</span>';
                case 'shipped':
                    return '<span class="badge bg-success">Shipped</span>';
                case 'completed':
                    return '<span class="badge bg-success">Completed</span>';
                case 'disputed':
                    return '<span class="badge bg-danger">Disputed</span>';
                case 'refunded':
                    return '<span class="badge bg-secondary">Refunded</span>';
                default:
                    return `<span class="badge bg-info">${value}</span>`;
            }
        }

        function paymentStatusFormatter(value, row, index) {
            switch (value) {
                case 'pending':
                    return '<span class="badge bg-warning text-dark">Pending</span>';
                case 'paid':
                    return '<span class="badge bg-success">Paid</span>';
                case 'rejected':
                    return '<span class="badge bg-danger">Rejected</span>';
                default:
                    return `<span class="badge bg-info">${value}</span>`;
            }
        }

        function actionFormatter(value, row, index) {
            if (row.payment_status == 'pending')
                return `<button class="btn btn-success btn-sm me-1" data-action="approve">Approve</button>
            <button class="btn btn-danger btn-sm" data-action="reject">Reject</button>`;
            else if (row.payment_status == 'paid')
                return `<button class="btn btn-warning btn-sm me-1" data-action="view">View</button>`;
        }
        //View Detail Disputed
        function viewDetailDispute(id) {
            // Make API call to approve
            fetch(`/order/disputed/${id}/detail`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    },
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    var detail_data = response.json();
                    $('#viewDetailModal').modal('show');
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
        window.actionEvents = {
            'click button': function(e, value, row, index) {
                const action = e.currentTarget.getAttribute('data-action');
                if (action === 'approve') {
                    // call your approve function
                    approveTransaction(row.id);
                } else if (action === 'reject') {
                    // call your reject function
                    rejectTransaction(row.id);
                } else if (action === 'view') {
                    // call your reject function
                    viewDetailDispute(row.id);
                }
            }


        };
    </script>
    @endsection