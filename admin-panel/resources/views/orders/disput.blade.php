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

    <!-- Enhanced Dispute Detail Modal -->
    <div id="viewDetailModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel1" aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title" id="myModalLabel1">
                        <i class="bi bi-shield-exclamation me-2"></i>{{ __('Dispute Resolution Center') }}
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-0">
                    <div class="row g-0">
                        <!-- Left Panel - Dispute Info -->
                        <div class="col-lg-4 border-end bg-light">
                            <div class="p-4">
                                <!-- Dispute Status Badge -->
                                <div class="text-center mb-4">
                                    <span id="disputeStatusBadge" class="badge bg-warning fs-6 px-4 py-2">Open</span>
                                </div>

                                <!-- Order Details Card -->
                                <div class="card shadow-sm mb-3">
                                    <div class="card-header bg-white">
                                        <h6 class="mb-0"><i class="bi bi-receipt me-2"></i>Order Details</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between mb-2">
                                            <span class="text-muted">Order ID:</span>
                                            <strong id="orderIdDisplay">#--</strong>
                                        </div>
                                        <div class="d-flex justify-content-between mb-2">
                                            <span class="text-muted">Item:</span>
                                            <strong id="itemNameDisplay">--</strong>
                                        </div>
                                        <div class="d-flex justify-content-between mb-2">
                                            <span class="text-muted">Amount:</span>
                                            <strong id="orderAmountDisplay" class="text-success">--</strong>
                                        </div>
                                        <div class="d-flex justify-content-between">
                                            <span class="text-muted">Net Amount:</span>
                                            <strong id="netAmountDisplay">--</strong>
                                        </div>
                                    </div>
                                </div>

                                <!-- Parties Involved -->
                                <div class="card shadow-sm mb-3">
                                    <div class="card-header bg-white">
                                        <h6 class="mb-0"><i class="bi bi-people me-2"></i>Parties Involved</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="d-flex align-items-center mb-3 p-2 bg-light rounded">
                                            <div class="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px;">
                                                <i class="bi bi-person"></i>
                                            </div>
                                            <div>
                                                <small class="text-muted d-block">Buyer</small>
                                                <strong id="buyerNameDisplay">--</strong>
                                            </div>
                                        </div>
                                        <div class="d-flex align-items-center p-2 bg-light rounded">
                                            <div class="avatar bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px;">
                                                <i class="bi bi-shop"></i>
                                            </div>
                                            <div>
                                                <small class="text-muted d-block">Seller</small>
                                                <strong id="sellerNameDisplay">--</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Proof Image -->
                                <div class="card shadow-sm" id="proofCard" style="display: none;">
                                    <div class="card-header bg-white">
                                        <h6 class="mb-0"><i class="bi bi-image me-2"></i>Proof Attached</h6>
                                    </div>
                                    <div class="card-body text-center">
                                        <a id="proofImageLink" href="#" target="_blank">
                                            <img id="proofImage" src="" alt="Proof" class="img-fluid rounded" style="max-height: 150px;">
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right Panel - Chat Messages -->
                        <div class="col-lg-8 d-flex flex-column">
                            <!-- Dispute Description Header -->
                            <div class="p-3 bg-warning bg-opacity-10 border-bottom">
                                <h6 class="mb-1"><i class="bi bi-exclamation-triangle me-2 text-warning"></i>Dispute Reason</h6>
                                <p id="disputeDescription" class="mb-0 text-muted">--</p>
                            </div>

                            <!-- Chat Messages Area -->
                            <div id="chatMessagesContainer" class="flex-grow-1 p-3" style="max-height: 400px; overflow-y: auto; background: #f8f9fa;">
                                <!-- Messages will be injected here -->
                            </div>

                            <!-- Resolution Actions -->
                            <div class="p-3 bg-white border-top" id="resolutionActions">
                                <h6 class="mb-3"><i class="bi bi-gavel me-2"></i>Resolution Decision</h6>
                                <div class="row g-2">
                                    <div class="col-md-6">
                                        <button type="button" class="btn btn-success w-100 py-3" id="favorBuyerBtn">
                                            <i class="bi bi-person-check me-2"></i>
                                            <span>Favor Buyer</span>
                                            <small class="d-block mt-1">Refund to buyer</small>
                                        </button>
                                    </div>
                                    <div class="col-md-6">
                                        <button type="button" class="btn btn-primary w-100 py-3" id="favorSellerBtn">
                                            <i class="bi bi-shop-window me-2"></i>
                                            <span>Favor Seller</span>
                                            <small class="d-block mt-1">Release to seller</small>
                                        </button>
                                    </div>
                                </div>
                                <div class="mt-3">
                                    <label class="form-label">Admin Notes (Optional)</label>
                                    <textarea id="adminNotes" class="form-control" rows="2" placeholder="Add resolution notes..."></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Confirmation Modal -->
    <div id="confirmationModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="confirmationModalLabel" aria-hidden="true" data-bs-backdrop="static">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow">
                <div class="modal-header border-0 pb-0">
                    <div class="d-flex align-items-center">
                        <div id="confirmIconWrapper" class="rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 50px; height: 50px;">
                            <i id="confirmIcon" class="bi fs-4"></i>
                        </div>
                        <h5 class="modal-title mb-0" id="confirmationModalLabel">Confirm Action</h5>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body pt-2">
                    <p id="confirmMessage" class="text-muted mb-0">Are you sure you want to proceed?</p>
                    <div id="confirmDetails" class="mt-3 p-3 bg-light rounded" style="display: none;">
                        <div class="d-flex justify-content-between mb-2">
                            <span class="text-muted">Order ID:</span>
                            <strong id="confirmOrderId">#--</strong>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span class="text-muted">Amount:</span>
                            <strong id="confirmAmount">--</strong>
                        </div>
                        <div class="d-flex justify-content-between">
                            <span class="text-muted">Recipient:</span>
                            <strong id="confirmRecipient">--</strong>
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-0 pt-0">
                    <button type="button" class="btn btn-light px-4" data-bs-dismiss="modal">
                        <i class="bi bi-x-lg me-1"></i>Cancel
                    </button>
                    <button type="button" class="btn px-4" id="confirmActionBtn">
                        <i class="bi bi-check-lg me-1"></i>Confirm
                    </button>
                </div>
            </div>
        </div>
    </div>
</section>
@endsection

@section('script')
<style>
    .chat-message {
        max-width: 75%;
        margin-bottom: 15px;
        animation: fadeIn 0.3s ease;
    }
    .chat-message.buyer {
        margin-right: auto;
    }
    .chat-message.seller {
        margin-left: auto;
    }
    .chat-bubble {
        padding: 12px 16px;
        border-radius: 18px;
        position: relative;
    }
    .chat-message.buyer .chat-bubble {
        background: #e3f2fd;
        border-bottom-left-radius: 4px;
    }
    .chat-message.seller .chat-bubble {
        background: #e8f5e9;
        border-bottom-right-radius: 4px;
    }
    .chat-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: white;
    }
    .chat-time {
        font-size: 11px;
        color: #999;
    }
    .chat-attachment {
        margin-top: 8px;
        padding: 8px;
        background: rgba(0,0,0,0.05);
        border-radius: 8px;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    #chatMessagesContainer::-webkit-scrollbar {
        width: 6px;
    }
    #chatMessagesContainer::-webkit-scrollbar-track {
        background: #f1f1f1;
    }
    #chatMessagesContainer::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;
    }
    /* Confirmation Modal Styles */
    #confirmationModal .modal-content {
        border-radius: 16px;
    }
    #confirmIconWrapper.buyer-favor {
        background: rgba(25, 135, 84, 0.1);
    }
    #confirmIconWrapper.buyer-favor i {
        color: #198754;
    }
    #confirmIconWrapper.seller-favor {
        background: rgba(13, 110, 253, 0.1);
    }
    #confirmIconWrapper.seller-favor i {
        color: #0d6efd;
    }
</style>

<script>
    let currentDisputeData = null;
    let pendingResolution = null;

    function updateApprovalSuccess() {
        $('#editStatusModal').modal('hide');
    }

    function approveTransaction(id) {
        fetch(`/order/transactions/${id}/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            showSuccessToast('Transaction approved!');
            $('table').bootstrapTable('refresh');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Something went wrong.');
        });
    }

    function rejectTransaction(id) {
        fetch(`/order/transactions/${id}/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            showSuccessToast('Transaction rejected!');
            $('table').bootstrapTable('refresh');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Something went wrong.');
        });
    }

    function statusFormatter(value, row, index) {
        const statusMap = {
            'processing': '<span class="badge bg-warning text-dark">Processing</span>',
            'delivered': '<span class="badge bg-warning text-dark">Delivered</span>',
            'shipped': '<span class="badge bg-success">Shipped</span>',
            'completed': '<span class="badge bg-success">Completed</span>',
            'disputed': '<span class="badge bg-danger">Disputed</span>',
            'refunded': '<span class="badge bg-secondary">Refunded</span>'
        };
        return statusMap[value] || `<span class="badge bg-info">${value}</span>`;
    }

    function paymentStatusFormatter(value, row, index) {
        const statusMap = {
            'pending': '<span class="badge bg-warning text-dark">Pending</span>',
            'paid': '<span class="badge bg-success">Paid</span>',
            'rejected': '<span class="badge bg-danger">Rejected</span>'
        };
        return statusMap[value] || `<span class="badge bg-info">${value}</span>`;
    }

    function actionFormatter(value, row, index) {
        if (row.payment_status == 'pending')
            return `<button class="btn btn-success btn-sm me-1" data-action="approve">Approve</button>
                    <button class="btn btn-danger btn-sm" data-action="reject">Reject</button>`;
        else if (row.payment_status == 'paid')
            return `<button class="btn btn-warning btn-sm me-1" data-action="view"><i class="bi bi-eye me-1"></i>View</button>`;
    }

    function formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    function renderChatMessages(contents, buyerId, sellerId, buyerName, sellerName) {
        const container = document.getElementById('chatMessagesContainer');
        container.innerHTML = '';

        if (!contents || contents.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="bi bi-chat-dots fs-1"></i>
                    <p class="mt-2">No messages in this dispute yet.</p>
                </div>
            `;
            return;
        }

        contents.forEach(msg => {
            const isBuyer = msg.user_id === buyerId;
            const userName = isBuyer ? buyerName : sellerName;
            const avatarBg = isBuyer ? '#2196F3' : '#4CAF50';
            const initial = userName.charAt(0).toUpperCase();

            let attachmentHtml = '';
            if (msg.attachment) {
                attachmentHtml = `
                    <div class="chat-attachment">
                        <a href="/storage/${msg.attachment}" target="_blank" class="text-decoration-none">
                            <i class="bi bi-paperclip me-1"></i>View Attachment
                        </a>
                    </div>
                `;
            }

            const messageHtml = `
                <div class="chat-message ${isBuyer ? 'buyer' : 'seller'}">
                    <div class="d-flex align-items-end ${isBuyer ? '' : 'flex-row-reverse'}">
                        <div class="chat-avatar ${isBuyer ? 'me-2' : 'ms-2'}" style="background: ${avatarBg};">
                            ${initial}
                        </div>
                        <div>
                            <div class="chat-bubble">
                                <small class="d-block fw-bold mb-1">${userName}</small>
                                <p class="mb-0">${msg.message}</p>
                                ${attachmentHtml}
                            </div>
                            <div class="chat-time ${isBuyer ? 'text-start' : 'text-end'} mt-1">
                                ${formatDateTime(msg.created_at)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += messageHtml;
        });

        container.scrollTop = container.scrollHeight;
    }

    function populateDisputeModal(data) {
        currentDisputeData = data;

        const statusBadge = document.getElementById('disputeStatusBadge');
        const statusColors = { 'open': 'warning', 'resolved': 'success', 'closed': 'secondary' };
        statusBadge.className = `badge bg-${statusColors[data.status] || 'info'} fs-6 px-4 py-2`;
        statusBadge.textContent = data.status.charAt(0).toUpperCase() + data.status.slice(1);

        document.getElementById('orderIdDisplay').textContent = `#${data.order?.id || '--'}`;
        document.getElementById('itemNameDisplay').textContent = data.order?.item?.name || '--';
        document.getElementById('orderAmountDisplay').textContent = `${data.order?.amount || '--'} ${data.order?.buyer?.wallet?.currency || ''}`;
        document.getElementById('netAmountDisplay').textContent = `${data.order?.net_amount || '--'} ${data.order?.buyer?.wallet?.currency || ''}`;

        document.getElementById('buyerNameDisplay').textContent = data.order?.buyer?.name || '--';
        document.getElementById('sellerNameDisplay').textContent = data.order?.seller?.name || '--';

        document.getElementById('disputeDescription').textContent = data.description || 'No description provided';

        if (data.proof) {
            document.getElementById('proofCard').style.display = 'block';
            document.getElementById('proofImage').src = `/storage/${data.proof}`;
            document.getElementById('proofImageLink').href = `/storage/${data.proof}`;
        } else {
            document.getElementById('proofCard').style.display = 'none';
        }

        renderChatMessages(
            data.contents,
            data.order?.buyer_id,
            data.order?.seller_id,
            data.order?.buyer?.name || 'Buyer',
            data.order?.seller?.name || 'Seller'
        );

        document.getElementById('resolutionActions').style.display = data.status === 'open' ? 'block' : 'none';
    }

    function viewDetailDispute(id) {
        fetch(`/order/disputed/${id}/detail`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            populateDisputeModal(data);
            $('#viewDetailModal').modal('show');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to load dispute details.');
        });
    }

    // Show confirmation modal
    function showConfirmationModal(favor) {
        if (!currentDisputeData) return;

        const isBuyer = favor === 'buyer';
        const iconWrapper = document.getElementById('confirmIconWrapper');
        const icon = document.getElementById('confirmIcon');
        const confirmBtn = document.getElementById('confirmActionBtn');
        const message = document.getElementById('confirmMessage');
        const details = document.getElementById('confirmDetails');

        // Reset classes
        iconWrapper.className = 'rounded-circle d-flex align-items-center justify-content-center me-3';
        
        if (isBuyer) {
            iconWrapper.classList.add('buyer-favor');
            icon.className = 'bi bi-person-check fs-4';
            confirmBtn.className = 'btn btn-success px-4';
            document.getElementById('confirmationModalLabel').textContent = 'Favor Buyer';
            message.innerHTML = 'You are about to resolve this dispute <strong>in favor of the buyer</strong>. The amount will be <strong>refunded</strong> to the buyer\'s wallet.';
            document.getElementById('confirmRecipient').textContent = currentDisputeData.order?.buyer?.name || '--';
        } else {
            iconWrapper.classList.add('seller-favor');
            icon.className = 'bi bi-shop-window fs-4';
            confirmBtn.className = 'btn btn-primary px-4';
            document.getElementById('confirmationModalLabel').textContent = 'Favor Seller';
            message.innerHTML = 'You are about to resolve this dispute <strong>in favor of the seller</strong>. The amount will be <strong>released</strong> to the seller\'s wallet.';
            document.getElementById('confirmRecipient').textContent = currentDisputeData.order?.seller?.name || '--';
        }

        // Populate details
        document.getElementById('confirmOrderId').textContent = `#${currentDisputeData.order?.id || '--'}`;
        document.getElementById('confirmAmount').textContent = `${currentDisputeData.order?.net_amount || '--'} ${currentDisputeData.order?.buyer?.wallet?.currency || ''}`;
        details.style.display = 'block';

        // Store pending resolution
        pendingResolution = favor;

        // Show modal
        $('#confirmationModal').modal('show');
    }

    // Resolution button handlers
    document.getElementById('favorBuyerBtn')?.addEventListener('click', function() {
        showConfirmationModal('buyer');
    });

    document.getElementById('favorSellerBtn')?.addEventListener('click', function() {
        showConfirmationModal('seller');
    });

    // Confirm action button
    document.getElementById('confirmActionBtn')?.addEventListener('click', function() {
        if (!currentDisputeData || !pendingResolution) return;
        
        const btn = this;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Processing...';
        
        resolveDispute(currentDisputeData.id, pendingResolution);
    });

    function resolveDispute(disputeId, favor) {
        const notes = document.getElementById('adminNotes').value;
        fetch(`/order/disputed/${disputeId}/resolve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({ favor: favor, notes: notes })
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            showSuccessToast(`Dispute resolved in favor of ${favor}!`);
            $('#confirmationModal').modal('hide');
            $('#viewDetailModal').modal('hide');
            $('table').bootstrapTable('refresh');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to resolve dispute.');
        })
        .finally(() => {
            const btn = document.getElementById('confirmActionBtn');
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Confirm';
            pendingResolution = null;
        });
    }

    window.actionEvents = {
        'click button': function(e, value, row, index) {
            const action = e.currentTarget.getAttribute('data-action');
            if (action === 'approve') {
                approveTransaction(row.id);
            } else if (action === 'reject') {
                rejectTransaction(row.id);
            } else if (action === 'view') {
                viewDetailDispute(row.id);
            }
        }
    };
</script>
@endsection
