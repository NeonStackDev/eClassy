'use client';

import React from "react";
import { Modal, Button, Typography, Tag, Descriptions, Input, Divider, Table } from "antd";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    RocketOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title } = Typography;

export default function OrderDetailsModal({
    visible,
    onClose,
    selectedOrder,
    handleApprove,
    handleDispute,
    handleViewDispute,
    handleReject,
    milestoneColumns,
    t
}) {
    if (!selectedOrder) return null;

    const getStatusIcon = (status) => {
        switch (status) {
            case "completed": return <CheckCircleOutlined />;
            case "refunded": return <CloseCircleOutlined />;
            case "processing": return <ClockCircleOutlined />;
            case "shipped": return <RocketOutlined />;
            default: return null;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "completed": return "green";
            case "refunded": return "red";
            case "processing": return "orange";
            case "shipped": return "blue";
            default: return "default";
        }
    };

    return (
        <Modal
            title={t("orderDetails")}
            centered
            open={visible}
            onCancel={onClose}
            width={900}
            footer={[
                <Button key="close" onClick={onClose}>{t("close")}</Button>,
                <Button
                    key="accept"
                    disabled={selectedOrder.status !== "new"}
                    type="primary"
                    onClick={handleApprove}
                >
                    {t("accept")}
                </Button>,
                <Button
                    key="dispute"
                    disabled={selectedOrder.status !== "processing"}
                    danger
                    onClick={handleDispute}
                >
                    {t("dispute")}
                </Button>,
                <Button
                    key="view_dispute"
                    disabled={selectedOrder.status !== "disputed"}
                    danger
                    onClick={handleViewDispute}
                >
                    {t("view_dispute")}
                </Button>,
                <Button
                    key="reject"
                    disabled={selectedOrder.status !== "new"}
                    danger
                    onClick={handleReject}
                >
                    {t("reject")}
                </Button>,
            ]}
        >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <Title level={4}>{t("order")} #{selectedOrder.id}</Title>
                <Tag
                    icon={getStatusIcon(selectedOrder.status)}
                    color={getStatusColor(selectedOrder.status)}
                    style={{ fontWeight: "bold", fontSize: 14, padding: "4px 4px", margin: '30px' }}
                >
                    {selectedOrder.status.toUpperCase()}
                </Tag>
            </div>

            <Descriptions bordered column={2} size="middle" labelStyle={{ fontWeight: 600 }}>
                <Descriptions.Item label={t("ProductName")}>{selectedOrder.item?.name || "-"}</Descriptions.Item>
                <Descriptions.Item label={t("BuyerName")}>{selectedOrder.buyer?.name || "-"}</Descriptions.Item>
                <Descriptions.Item label={t("PaymentType")}>{selectedOrder.payment_method}</Descriptions.Item>
                <Descriptions.Item label={t("amount")}>
                    <Input
                        value={selectedOrder.net_amount}
                        type="number"
                        onChange={(e) => {
                            const value = e.target.value;
                            selectedOrder.setNetAmount?.(value); // optional setter
                        }}
                    />
                </Descriptions.Item>
                <Descriptions.Item label={t("datetime")}>
                    {dayjs(selectedOrder.created_at).format("YYYY-MM-DD HH:mm")}
                </Descriptions.Item>
                <Descriptions.Item label={t("shippingAddress")} span={2}>
                    {selectedOrder.shipping_address || "-"}
                </Descriptions.Item>
            </Descriptions>

            {selectedOrder.milestones?.length > 0 && (
                <>
                    <Divider />
                    <Title level={5}>{t("milestones")}</Title>
                    <Table
                        size="small"
                        pagination={false}
                        dataSource={selectedOrder.milestones}
                        columns={milestoneColumns}
                        rowKey="id"
                    />
                </>
            )}

            <Divider />
        </Modal>
    );
}
