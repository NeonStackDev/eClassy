'use client';
import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Radio,
  Button,
  InputNumber,
  Divider,
  Row,
  Col,
  Card,
  Typography,
} from "antd";
import {
  CloseOutlined,
  WalletOutlined,
  HomeOutlined,
  PlusCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { t } from "@/utils";
import caculateNetAmount from "@/utils/caculateNetAmount";

const { Text } = Typography;

const BuyNowModal = ({ open, onClose, onConfirm = () => {} }) => {
  const [form] = Form.useForm();
  const [paymentType, setPaymentType] = useState("escrow");
  const [milestoneType, setMilestoneType] = useState("single");
  const [milestones, setMilestones] = useState([
    { title: "", description: "", amount: null, fee: 0 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add milestone
  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { title: "", description: "", amount: null, fee: 0 },
    ]);
  };

  // Update milestone
  const updateMilestone = async (index, field, value) => {
    const updated = [...milestones];
    updated[index][field] = value;

    if (field === "amount" && value !== null && value !== undefined) {
      const fee = await caculateNetAmount(value);
      updated[index].fee = fee?.fee || 0;
    }

    setMilestones(updated);
  };

  // Remove milestone
  const removeMilestone = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  // Calculate total amounts
  const getTotalAmount = () => milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
  const getTotalFee = () => milestones.reduce((sum, m) => sum + (m.fee || 0), 0);

  // Form submission
  const handleFinish = (values) => {
    // Filter out empty milestones
    let filteredMilestones = milestones.filter(
      (m) =>
        m.title?.trim() &&
        m.description?.trim() &&
        m.amount !== null &&
        m.amount > 0
    );

    // Prevent submitting empty milestones for multiple
    if (milestoneType === "multiple" && filteredMilestones.length === 0) {
      alert(t("pleaseAddAtLeastOneMilestone"));
      return;
    }
    console.log(filteredMilestones);
    
    const payload = {
      ...values,
      milestones: milestoneType === "multiple" ? filteredMilestones : filteredMilestones.slice(0, 1),
    };

    onConfirm(payload);

    form.resetFields();
    setMilestones([{ title: "", description: "", amount: null, fee: 0 }]);
    onClose();
  };

  // Unified Milestone Cards (single or multiple)
  const renderMilestones = () => {
    const cards = milestoneType === "single" ? [milestones[0]] : milestones;

    return (
      <div>
        {cards.map((m, index) => (
          <Card
            key={index}
            size="small"
            bordered
            style={{
              marginBottom: 16,
              borderRadius: 10,
              background: "#fafafa",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
            title={`${t("milestone")} ${index + 1}`}
            extra={
              milestoneType === "multiple" && index > 0 && (
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => removeMilestone(index)}
                />
              )
            }
          >
            <Form layout="vertical">
              <Form.Item
                label={t("milestoneTitle")}
                required
              >
                <Input
                  placeholder={t("enterMilestoneTitle")}
                  value={m.title}
                  onChange={(e) => updateMilestone(index, "title", e.target.value)}
                />
              </Form.Item>

              <Form.Item
                label={t("milestoneDescription")}
                required
              >
                <Input.TextArea
                  placeholder={t("enterMilestoneDescription")}
                  value={m.description}
                  onChange={(e) =>
                    updateMilestone(index, "description", e.target.value)
                  }
                  rows={3}
                />
              </Form.Item>

              <Row gutter={[12, 12]}>
                <Col xs={24} md={12}>
                  <Form.Item label={t("amount")} required>
                    <InputNumber
                      placeholder={t("enterAmount")}
                      min={0}
                      value={m.amount}
                      onChange={(value) => updateMilestone(index, "amount", value)}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item label={t("fee")}>
                    <InputNumber
                      value={m.fee || 0}
                      readOnly
                      style={{ width: "100%", background: "#f5f5f5" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        ))}

        {/* Add Milestone button only for multiple */}
        {milestoneType === "multiple" && (
          <Button
            type="dashed"
            onClick={addMilestone}
            icon={<PlusCircleOutlined />}
            style={{
              width: "100%",
              borderRadius: 8,
              padding: "10px 0",
              fontWeight: 500,
            }}
          >
            {t("addMilestone")}
          </Button>
        )}

        {/* Totals */}
        <Card
          size="small"
          style={{ marginTop: 16, borderRadius: 8, background: "#fafafa" }}
        >
          <Row justify="space-between" style={{ marginBottom: 4 }}>
            <Text strong>{t("totalAmount")}:</Text>
            <Text>PKR {getTotalAmount().toFixed(2)}</Text>
          </Row>
          <Row justify="space-between">
            <Text strong>{t("totalFees")}:</Text>
            <Text>PKR {getTotalFee().toFixed(2)}</Text>
          </Row>
        </Card>
      </div>
    );
  };

  return (
    <Modal
      centered
      open={open}
      title={<span style={{ fontWeight: 600 }}>{t("buyNow")}</span>}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ maxWidth: 700 }}
      closeIcon={<CloseOutlined />}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        initialValues={{ paymentType: "escrow" }}
      >
        {/* Payment Type */}
        <Form.Item label={t("selectPaymentMethod")} name="paymentType">
          <Radio.Group
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            style={{ display: "flex", gap: 12 }}
          >
            <Radio.Button value="escrow" style={{ flex: 1, textAlign: "center" }}>
              <WalletOutlined style={{ marginRight: 6 }} />
              {t("escrowPayment")}
            </Radio.Button>
            <Radio.Button value="cod" style={{ flex: 1, textAlign: "center" }}>
              <HomeOutlined style={{ marginRight: 6 }} />
              {t("cashOnDelivery")}
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        {/* Escrow Section */}
        {paymentType === "escrow" && (
          <>
            <Form.Item label={t("milestoneType")} name="milestoneType">
              <Radio.Group
                value={milestoneType}
                onChange={(e) => setMilestoneType(e.target.value)}
              >
                <Radio.Button value="single">{t("singlePayment")}</Radio.Button>
                <Radio.Button value="multiple">{t("multipleMilestones")}</Radio.Button>
              </Radio.Group>
            </Form.Item>

            {renderMilestones()}
          </>
        )}

        {/* COD Section */}
        {paymentType === "cod" && (
          <div
            style={{
              padding: 20,
              background: "#fafafa",
              borderRadius: 8,
              border: "1px solid #f0f0f0",
            }}
          >
            <Form.Item
              label={t("fullName")}
              name="fullName"
              rules={[{ required: true, message: t("pleaseEnterFullName") }]}
            >
              <Input placeholder={t("enterFullName")} />
            </Form.Item>

            <Form.Item
              label={t("phoneNumber")}
              name="phoneNumber"
              rules={[{ required: true, message: t("pleaseEnterPhoneNumber") }]}
            >
              <Input placeholder={t("enterPhoneNumber")} maxLength={15} />
            </Form.Item>

            <Form.Item
              label={t("shippingAddress")}
              name="shippingAddress"
              rules={[{ required: true, message: t("pleaseEnterAddress") }]}
            >
              <Input.TextArea rows={3} placeholder={t("enterFullAddress")} />
            </Form.Item>
          </div>
        )}

        <Divider />

        <div style={{ textAlign: "right" }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            style={{ borderRadius: 6 }}
          >
            {isSubmitting ? t("processing") : t("confirmOrder")}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default BuyNowModal;
