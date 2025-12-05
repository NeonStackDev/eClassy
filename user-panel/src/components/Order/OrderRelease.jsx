'use client'
import React from 'react';
import { Modal, Descriptions, Table, Button, Tag, Divider, Typography, Tooltip } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, RocketOutlined, ExportOutlined, DownloadOutlined } from '@ant-design/icons';
import Link from 'next/link';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const OrderRelease = ({
    visible,
    onClose,
    selectedOrder,
    handleApprove,
    handleDispute,
    handleViewDispute,
    milestoneColumns,
    t,
}) => {
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
                    key="approve"
                    disabled={selectedOrder?.status !== "delivered"}
                    type="primary"
                    hidden={selectedOrder?.milestone_type === "multiple"}
                    onClick={handleApprove}
                >
                    {t("approve")}
                </Button>,
                <Button
                    key="dispute"
                    disabled={selectedOrder?.status !== "delivered"}
                    danger
                    onClick={handleDispute}
                >
                    {t("dispute")}
                </Button>,
                <Button
                    key="view_dispute"
                    disabled={selectedOrder?.status !== "disputed"}
                    danger
                    onClick={handleViewDispute}
                >
                    {t("view_dispute")}
                </Button>,
            ]}
        >
            {selectedOrder && (
                <>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                        <Title level={4}>{t("order")} #{selectedOrder.id}</Title>
                        <Tag
                            icon={
                                selectedOrder.status === "completed" ? <CheckCircleOutlined /> :
                                    selectedOrder.status === "refunded" ? <CloseCircleOutlined /> :
                                        selectedOrder.status === "processing" ? <ClockCircleOutlined /> :
                                            selectedOrder.status === "shipped" ? <RocketOutlined /> : null
                            }
                            color={
                                selectedOrder.status === "completed" ? "green" :
                                    selectedOrder.status === "refunded" ? "red" :
                                        selectedOrder.status === "processing" ? "orange" :
                                            selectedOrder.status === "shipped" ? "blue" :
                                                selectedOrder.status === "delivered" ? "blue" : "default"
                            }
                            style={{ fontWeight: "bold", fontSize: 14, padding: "4px 4px", margin: '30px' }}
                        >
                            {selectedOrder.status.toUpperCase()}
                        </Tag>
                    </div>

                    <Descriptions bordered column={2} size="middle" labelStyle={{ fontWeight: 600 }}>
                        <Descriptions.Item label={t("ProductName")}>{selectedOrder.item?.name || "-"}</Descriptions.Item>
                        <Descriptions.Item label={t("SellerName")}>{selectedOrder.seller?.name || "-"}</Descriptions.Item>
                        <Descriptions.Item label={t("PaymentType")}>{selectedOrder.payment_method}</Descriptions.Item>
                        <Descriptions.Item label={t("amount")}>
                            <Text strong style={{ color: "#1677ff" }}>{selectedOrder.net_amount}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label={t("datetime")}>
                            {dayjs(selectedOrder.created_at).format("YYYY-MM-DD HH:mm")}
                        </Descriptions.Item>
                        <Descriptions.Item label={t("deliveryNote")}>{selectedOrder.delivery_note}</Descriptions.Item>
                        <Descriptions.Item label={t("deliveryLink")}>
                            {selectedOrder?.delivery_link ? (
                                <Link href={selectedOrder.delivery_link} target="_blank" rel="noopener noreferrer">
                                    <ExportOutlined />
                                </Link>
                            ) : ''}
                        </Descriptions.Item>
                        <Descriptions.Item label={t("deliveryFile")}>
                            {selectedOrder.delivery_file ? (
                                <Tooltip title={t("downloadFile")}>
                                    <Button
                                        type="link"
                                        icon={<DownloadOutlined />}
                                        href={selectedOrder.delivery_file}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: "#1677ff", fontWeight: 500, padding: 0 }}
                                    >
                                        {t("download")}
                                    </Button>
                                </Tooltip>
                            ) : (
                                <span style={{ color: "#999" }}>{t("noFileAttached")}</span>
                            )}
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
                </>
            )}
        </Modal>
    );
};

export default OrderRelease;
