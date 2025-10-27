import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Radio,
  Button,
  InputNumber,
  Space,
  Divider,
} from "antd";
import {
  CloseOutlined,
  WalletOutlined,
  HomeOutlined,
  DollarOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { t } from "@/utils";

const BuyNowModal = ({ open, onClose, onConfirm = () => {} }) => {
  const [form] = Form.useForm();
  const [paymentType, setPaymentType] = useState("escrow");
  const [milestoneType, setMilestoneType] = useState("single");
  const [milestones, setMilestones] = useState([{ title: "", amount: null }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add milestone
  const addMilestone = () => {
    setMilestones([...milestones, { title: "", amount: null }]);
  };

  // Update milestone
  const updateMilestone = (index, field, value) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  // Remove milestone
  const removeMilestone = (index) => {
    const updated = milestones.filter((_, i) => i !== index);
    setMilestones(updated);
  };

  // Handle form submission
  const handleFinish = (values) => {
    const payload = {
      ...values, // All AntD form fields
      milestones: milestoneType === "multiple" ? milestones : undefined,
    };
    console.log("Buy Now Form Data:", payload); // ✅ Here is your full form data
    onConfirm(payload); // Callback to parent
    form.resetFields();
    setMilestones([{ title: "", amount: null }]);
    onClose();
  };

  return (
    <Modal
      centered
      open={open}
      title={t("buyNow")}
      onCancel={onClose}
      footer={null}
      closeIcon={<CloseOutlined />}
      className="buyNowModal"
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
          >
            <Radio.Button value="escrow">
              <WalletOutlined style={{ marginRight: 8 }} />
              {t("escrowPayment")}
            </Radio.Button>
            <Radio.Button value="cod">
              <HomeOutlined style={{ marginRight: 8 }} />
              {t("cashOnDelivery")}
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        {/* Escrow Payment */}
        {paymentType === "escrow" && (
          <>
            <Form.Item label={t("milestoneType")} name="milestoneType">
              <Radio.Group
                value={milestoneType}
                onChange={(e) => setMilestoneType(e.target.value)}
              >
                <Radio.Button value="single">{t("singlePayment")}</Radio.Button>
                <Radio.Button value="multiple">
                  {t("multipleMilestones")}
                </Radio.Button>
              </Radio.Group>
            </Form.Item>

            {/* Single Payment */}
            {milestoneType === "single" && (
              <Form.Item
                label={t("totalAmount")}
                name="totalAmount"
                rules={[{ required: true, message: t("pleaseEnterAmount") }]}
              >
                <InputNumber
                  prefix={<DollarOutlined />}
                  min={0}
                  style={{ width: "100%" }}
                  placeholder={t("enterAmount")}
                />
              </Form.Item>
            )}

            {/* Multiple Milestones */}
            {milestoneType === "multiple" && (
              <>
                {milestones.map((m, index) => (
                  <Space
                    key={index}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Input
                      placeholder={t("milestoneTitle")}
                      value={m.title}
                      onChange={(e) =>
                        updateMilestone(index, "title", e.target.value)
                      }
                    />
                    <InputNumber
                      placeholder={t("milestoneAmount")}
                      min={0}
                      value={m.amount}
                      onChange={(value) =>
                        updateMilestone(index, "amount", value)
                      }
                    />
                    {index > 0 && (
                      <Button
                        type="text"
                        danger
                        onClick={() => removeMilestone(index)}
                      >
                        ×
                      </Button>
                    )}
                  </Space>
                ))}
                <Button
                  type="dashed"
                  onClick={addMilestone}
                  icon={<PlusCircleOutlined />}
                  style={{ width: "100%", marginBottom: 16 }}
                >
                  {t("addMilestone")}
                </Button>
              </>
            )}
          </>
        )}

        {/* COD */}
        {paymentType === "cod" && (
          <Form.Item
            label={t("shippingAddress")}
            name="shippingAddress"
            rules={[{ required: true, message: t("pleaseEnterAddress") }]}
          >
            <Input.TextArea rows={3} placeholder={t("enterFullAddress")} />
          </Form.Item>
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
