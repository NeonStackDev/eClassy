'use client';

import React, { useState } from "react";
import { Modal, Form, Input, Button, Upload, Divider } from "antd";
import { UploadOutlined } from "@ant-design/icons";

export default function DeliveryModal({
    visible,
    onClose,
    selectedOrder,
    onHandleSubmit,  // for escrow delivery
    handleShip,    // for COD/non-escrow delivery
    t
}) {
    const [deliveryForm] = Form.useForm();
    const [file, setFile] = useState(null);

    const handleSubmit = async () => {
        try {
            const values = await deliveryForm.validateFields();
            // if (!feePaid) {
            //     message.error(t("payFeeBeforeSubmitting"));
            //     return;
            // }

            if (onHandleSubmit) {
                await onHandleSubmit({ ...values,delivery_file:file });
            }

           
            onClose();
            deliveryForm.resetFields();
            setFeePaid(false);
            setPaymentMethod(null);
            setUploadFile(null);
        } catch (err) {
            console.log("Validation Failed:", err);
        }
    };

    if (!selectedOrder) return null;

    return (
        <Modal
            title={t("orderDetails")}
            centered
            open={visible}
            onCancel={onClose}
            width={900}
            footer={null}
        >
            {selectedOrder.payment_method === "escrow" ? (
                // Escrow delivery form
                <Form layout="vertical" onFinish={handleSubmit} form={deliveryForm}>
                    <Form.Item
                        label={t("deliveryNote")}
                        name="delivery_note"
                        rules={[{ required: true, message: t("pleaseEnterDeliveryNote") }]}
                    >
                        <Input.TextArea rows={4} placeholder={t("deliveryNote")} />
                    </Form.Item>

                    <Form.Item
                        label={t("courierName")}
                        name="courier_name"
                        rules={[{ required: true, message: t("pleaseEnterCourierName") }]}
                    >
                        <Input placeholder={t("courierName")} />
                    </Form.Item>

                    <Form.Item
                        label={t("trackingNumber")}
                        name="tracking_number"
                        rules={[{ required: true, message: t("pleaseEnterTrackingNumber") }]}
                    >
                        <Input placeholder={t("trackingNumber")} />
                    </Form.Item>

                    <Form.Item label={t("deliveryLink")} name="delivery_link">
                        <Input type="url" placeholder={t("deliveryLinkOptional")} />
                    </Form.Item>

                    <Form.Item label={t("attachFile")} name="delivery_file">
                        <Upload
                            beforeUpload={(file) => {
                                setFile(file);
                                return false; // prevent auto upload
                            }}
                            maxCount={1}
                        >
                            <Button icon={<UploadOutlined />}>{t("uploadFile")}</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            disabled={selectedOrder.status !== "processing"}
                        >
                            {t("submitDelivery")}
                        </Button>
                    </Form.Item>
                </Form>
            ) : (
                // COD / Non-escrow delivery form
                <Form layout="vertical" onFinish={handleShip} form={deliveryForm}>
                    <Form.Item
                        label={t("courierName")}
                        name="courier_name"
                        rules={[{ required: true, message: t("pleaseEnterCourierName") }]}
                    >
                        <Input placeholder={t("courierName")} />
                    </Form.Item>

                    <Form.Item
                        label={t("trackingNumber")}
                        name="tracking_number"
                        rules={[{ required: true, message: t("pleaseEnterTrackingNumber") }]}
                    >
                        <Input placeholder={t("trackingNumber")} />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            disabled={selectedOrder.status !== "processing"}
                        >
                            {t("markAsShipped")}
                        </Button>
                    </Form.Item>
                </Form>
            )}
            <Divider />
        </Modal>
    );
}
