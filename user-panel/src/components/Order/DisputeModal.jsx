'use client';

import React, { useState } from "react";
import { Modal, Form, Input, Upload, Button, Radio, Divider, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

export default function DisputeModal({
    visible,
    onClose,
    selectedOrder,
    disputeFee = 0,
    onPayFee,      // handler when fee is paid
    onSubmitDispute, // handler for final dispute submit
    t
}) {
    const [form] = Form.useForm();
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [feePaid, setFeePaid] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    console.log(selectedOrder);
    
    if (!selectedOrder) return null;

    const handlePayment = async () => {
        if (!paymentMethod) {
            message.warning(t("pleaseSelectPaymentMethod"));
            return;
        }

        // Call parent payment handler if exists
        if (onPayFee) {
            const success = await onPayFee(paymentMethod, disputeFee);
            if (success) setFeePaid(true);
        } else {
            // Simulate payment
            message.success(t("feePaidSuccessfully"));
            setFeePaid(true);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            // if (!feePaid) {
            //     message.error(t("payFeeBeforeSubmitting"));
            //     return;
            // }

            if (onSubmitDispute) {
                await onSubmitDispute({ ...values, orderId: selectedOrder.id,proof:uploadFile });
            }

           
            onClose();
            form.resetFields();
            setFeePaid(false);
            setPaymentMethod(null);
            setUploadFile(null);
        } catch (err) {
            console.log("Validation Failed:", err);
        }
    };

    const uploadProps = {
        beforeUpload: (file) => {
            setUploadFile(file);
            return false;
        },
        onRemove: () => setUploadFile(null),
        fileList: uploadFile ? [uploadFile] : [],
    };

    return (
        <Modal
            title={t("disputeForm")}
            centered
            open={visible}
            onCancel={onClose}
            width={600}
            footer={[
                <Button key="pay" type="primary" onClick={handlePayment} hidden>
                    {t("payFee")}
                </Button>,
                <Button key="submit" type="primary" onClick={handleSubmit} >
                    {t("submitDispute")}
                </Button>,
            ]}
        >
            <p>{t("disputeFee")}: <b>{disputeFee} PKR</b></p>

            <Form form={form} layout="vertical">
                <Form.Item
                    name="paymentMethod"
                    label={t("paymentMethod")}
                    rules={[{ required: true, message: t("pleaseSelectPaymentMethod") }]}
                >
                    <Radio.Group onChange={(e) => setPaymentMethod(e.target.value)}>
                        <Radio value="wallet">{t("payFromWallet")}</Radio>
                        <Radio value="gateway">{t("payWithGateway")}</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item
                    name="proof"
                    label={t("proof")}
                    rules={[{ required: true, message: t("pleaseUploadProof") }]}
                >
                    <Upload {...uploadProps} maxCount={1}>
                        <Button icon={<UploadOutlined />}>{t("uploadFile")}</Button>
                    </Upload>
                </Form.Item>

                <Form.Item
                    name="description"
                    label={t("description")}
                    rules={[{ required: true, message: t("pleaseEnterDescription") }]}
                >
                    <Input.TextArea rows={3} placeholder={t("enterDealDetails")} />
                </Form.Item>

                <Form.Item
                    name="issue"
                    label={t("issue")}
                    rules={[{ required: true, message: t("pleaseEnterIssue") }]}
                >
                    <Input placeholder={t("describeIssue")} />
                </Form.Item>

                <Form.Item label={t("fixedFee")}>
                    <Input value={disputeFee} disabled />
                </Form.Item>
            </Form>

            <Divider />
        </Modal>
    );
}
