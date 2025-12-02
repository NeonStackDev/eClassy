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
                            <div id="filters" class="d-flex flex-wrap align-items-end gap-2">
                           
                                    <label for="filter_status">{{__("Status")}}</label>
                                    <select class="form-control bootstrap-table-filter-control-status" id="filter_status">
                                        <option value="">{{__("All")}}</option>
                                        <option value="new">{{__("New")}}</option>
                                        <option value="completed">{{__("Completed")}}</option>
                                        <option value="processing">{{__("Pending")}}</option>
                                        <option value="cancelled">{{__("Cancelled")}}</option>
                                        <option value="disputed">{{__("Disputed")}}</option>
                                    </select>
                          
                                
                            </div>
                            <table class="table-borderless table-striped" aria-describedby="mydesc" id="table_list"
                                data-toggle="table" data-url="{{ route('order.show') }}" data-click-to-select="true"
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
                                        <th scope="col" data-field="item.name" data-align="center" data-sortable="true">{{ __('Item Name') }}</th>
                                        <th scope="col" data-field="buyer.name" data-align="center" data-sortable="true">{{ __('Buyer Name') }}</th>
                                        <th scope="col" data-field="seller.name" data-align="center" data-sortable="true">{{ __('Seller Name') }}</th>
                                        <th scope="col" data-field="status" data-align="center" data-formatter="statusFormatter" data-sortable="true">{{ __('Status') }}</th>
                                        <th scope="col" data-field="created_at" data-align="center">{{ __('Date') }}</th>
                                        <th scope="col" data-field="amount" data-align="center" data-sortable="true">{{ __('Amount') }}</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                    </div>
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

        

        function actionFormatter(value, row, index) {
            if (row.status == 'pending')
                return `<button class="btn btn-success btn-sm me-1" data-action="approve">Approve</button>
            <button class="btn btn-danger btn-sm" data-action="reject">Reject</button>`;
        }
    </script>
    @endsection