'use client'

import { useState } from "react";
import { Modal, Input, Button, message } from "antd";

export default function PayFastModal({
    open,
    onCancel,
    onSubmit,
    merchantId,
    amount,
    merchantKey,
    pfHost,
    returnUrl,
    cancelUrl,
    notifyUrl,
    userEmail,
    userFirstName,
    userLastName,
    paymentId,
}) {
   

    const handleSubmit = () => {       
        const payload = {
            merchant_id: merchantId,
            merchant_key: merchantKey,
            pfHost,
            return_url: returnUrl,
            cancel_url: cancelUrl,
            notify_url: notifyUrl,
            m_payment_id: paymentId,
            amount: parseFloat(amount).toFixed(2),
            item_name: `dispute-${paymentId}`,
            email_address: userEmail,
            name_first: userFirstName,
            name_last: userLastName || "",
        };
        onSubmit(payload);
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            title="PayFast Deposit"
        >
            <div className="space-y-4">
                <Input
                    placeholder="Enter amount"
                    value={amount}
                    
                />

                <Button
                    type="primary"
                    block
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
            </div>
        </Modal>
    );
}
