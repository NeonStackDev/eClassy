'use client'
import BreadcrumbComponent from "@/components/Breadcrumb/BreadcrumbComponent"
import ProfileSidebar from "@/components/Profile/ProfileSidebar"
import TransactionsWallet from "@/components/Profile/TransactionsWallet"
import { t } from "@/utils"
import {
    getWalletApi, putDepositApi,putWithdrawApi ,
} from "@/utils/api";
import { BsArrowUpRight, BsPlusLg } from "react-icons/bs";
import { useEffect, useState } from "react";
import {
    Modal, Tabs, Form, Input, Select, Button, Upload, message, Card,
    Typography,
} from "antd";
import { UploadOutlined, DollarCircleOutlined } from "@ant-design/icons";
const { TabPane } = Tabs;


const Wallet = () => {
    
    const [wallet, setWallet] = useState({ balance: 0, reserved_balance: 0 });    
    const [loading, setLoading] = useState(true);

    // Deposit form state    
    const [depositLoading, setDepositLoading] = useState(false);

    // Withdraw form state 
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [openDepositModal, setOpenDepositModal] = useState(false);
    const [openWithdrawModal, setOpenWithdrawModal] = useState(false);
    const [tab, setTab] = useState("manual"); // manual or auto
    const [form] = Form.useForm();
    const [amount, setAmount] = useState(0);
    const [reason, setWidthrawReason] = useState("");
    const [feeTiers, setFeeTiers] = useState([]);
    const [feePercent, setfeePercent] = useState(0);
    const [file, setFile] = useState(null);
    const [netAmount, setNetAmount] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);
    //const netAmount = amount - (amount * feePercent) / 100;

    // Load wallet & transactions
    const fetchWallet = async () => {
        setLoading(true);
        try {
            const resWallet = await getWalletApi.getWallet();
            setWallet(resWallet.data.data.wallet);
            setFeeTiers(resWallet.data.data.commission)
            console.log(resWallet);

        } catch (err) {
            console.error(err);
            alert("Failed to load wallet data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWallet();
    }, []);
    useEffect(() => {
        console.log(feeTiers);
        if (!amount || !feeTiers || feeTiers.length === 0) {
            setNetAmount(0);
        }
        // Find matching tier for this amount
        const tier = feeTiers.find(
            (t) =>
                amount >= parseFloat(t.min_amount) &&
                amount <= parseFloat(t.max_amount)
        );
        if (!tier) {
            // if no tier matched, return original amount
            setNetAmount(0);
        }
        else {
            const percent = parseFloat(tier.percentage);
            setfeePercent(percent);
            const flat = parseFloat(tier.flat_fee);
            const fee = (amount * percent) / 100 + flat;
            const net = amount - fee;
            setNetAmount(net);

        }
    }, [amount]);

    // Handle manual deposit
    async function handleDeposit(values) {
        const check_limit = feeTiers.find(
            (t) =>
                amount >= parseFloat(t.min_amount) &&
                amount <= parseFloat(t.max_amount)
        );
        if (!check_limit) {
            // if no tier matched, return original amount
            message.error("No tier matched");
            return;
        }
        const finalData = {
            ...values,
            fee: (amount * feePercent) / 100,
            net_amount: netAmount,
            mode: tab,
        };
        setDepositLoading(true);
        // Send to backend
        console.log(finalData);
        const response = await putDepositApi.putDeposit({
            amount: finalData.amount,
            method: finalData.method,
            fee: finalData.fee,
            mode: finalData.mode,
            type: 'deposit',
            net_amount: finalData.net_amount,
            receipt: file
        });
        console.log(response);

        message.success("Deposit submitted successfully!");
        form.resetFields();
        setAmount(0);
        setFile(null);
        setDepositLoading(false);
        setOpenDepositModal(false);
        setRefreshKey((prev) => prev + 1);
    };

    // Handle withdrawal
    async function handleWithdraw(values) {
        const check_limit = feeTiers.find(
            (t) =>
                amount >= parseFloat(t.min_amount) &&
                amount <= parseFloat(t.max_amount)
        );
        if (!check_limit) {
            // if no tier matched, return original amount
            message.error("No tier matched");
            return;
        }
        const finalData = {
            ...values,
            fee: (amount * feePercent) / 100,
            net_amount: netAmount,
            mode: 'manual',
        };
        setWithdrawLoading(true);
        // Send to backend
        const response = await putWithdrawApi.putWithdraw({
            amount: finalData.amount,
            method: finalData.method,
            fee: finalData.fee,
            mode: finalData.mode,
            type: 'withdrawal',
            net_amount: finalData.net_amount,
            reason: finalData.reason
        });
        console.log(response);

        message.success("Withdraw submitted successfully!");
        form.resetFields();
        setAmount(0);
        setFile(null);
        setWithdrawLoading(false);
        setOpenWithdrawModal(false);
        setRefreshKey((prev) => prev + 1);
    };
    if (loading) return <p>Loading wallet...</p>;


    return (
        <>
            <BreadcrumbComponent title2={t('wallet')} />
            <div className='container'>
                <div className="row my_prop_title_spacing">
                    <h4 className="pop_cat_head">{t('myWallet')}</h4>
                </div>
                <div className="row profile_sidebar">
                    <ProfileSidebar />
                    <div className="col-lg-9 p-0">
                        <div className="notif_cont  text-center">
                            <div className="row min-h-48">
                                <div className="col-sm-6 wallet-card p-3 justify-content-center rounded-4" >
                                    <span className="mb-20">Total Balance</span>
                                    <h2 className="mt-2">{wallet?.balance}</h2>
                                </div>
                                <div className="col-sm-6 justify-content-center">
                                    <div className="wallet-card p-3 rounded-4 cursor-pointer" onClick={() => setOpenDepositModal(true)}>
                                        Deposit <BsPlusLg />
                                    </div>
                                    <div className="wallet-card p-3  mt-4 rounded-4 cursor-pointer" onClick={() => setOpenWithdrawModal(true)}>
                                        Withraw <BsArrowUpRight />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="notif_cont">
                            <TransactionsWallet key={refreshKey} />
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                title="Deposit Funds"
                centered
                open={openDepositModal}
                onOk={() => setOpenDepositModal(false)}
                onCancel={() => setOpenDepositModal(false)}
                footer={null}
                width={600}
            >
                <Tabs defaultActiveKey="manual" centered>
                    {["manual", "auto"].map((type) => (
                        <TabPane tab={type === "manual" ? "Manual" : "Auto"} key={type}>
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleDeposit}
                                className="mt-3"
                            >
                                <Form.Item
                                    label="Amount"
                                    name="amount"
                                    rules={[{ required: true, message: "Please enter amount" }]}
                                >
                                    <Input
                                        type="number"
                                        placeholder="Enter amount"
                                        value={amount}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                    />
                                </Form.Item>

                                {amount > 0 && (
                                    <p className="text-gray-600 mb-3">
                                        Fee ({feePercent}%): {(amount * feePercent) / 100} |{" "}
                                        <b>Net Amount: {netAmount}</b>
                                    </p>
                                )}

                                <Form.Item
                                    label="Method"
                                    name="method"
                                    rules={[{ required: true, message: "Please select a method" }]}
                                >
                                    <Select placeholder="Select deposit method">
                                        <Select.Option value={`easypaisa_${type}`}>
                                            EasyPaisa {type === "manual" ? "(Manual)" : "(Auto)"}
                                        </Select.Option>
                                        <Select.Option value={`jazzcash_${type}`}>
                                            JazzCash {type === "manual" ? "(Manual)" : "(Auto)"}
                                        </Select.Option>
                                        <Select.Option value={`bank_${type}`}>
                                            Bank Transfer {type === "manual" ? "(Manual)" : "(Auto)"}
                                        </Select.Option>
                                    </Select>
                                </Form.Item>

                                {type === "manual" && (
                                    <Form.Item label="Upload Receipt" name="receipt">
                                        <Upload
                                            beforeUpload={(file) => {
                                                setFile(file);
                                                return false; // prevent auto upload
                                            }}
                                            maxCount={1}
                                        >
                                            <Button icon={<UploadOutlined />}>Click to Upload</Button>
                                        </Upload>
                                    </Form.Item>
                                )}

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        className="ad_listing"
                                        loading={depositLoading}
                                        block
                                    >
                                        Submit Deposit
                                    </Button>
                                </Form.Item>
                            </Form>
                        </TabPane>
                    ))}
                </Tabs>
            </Modal>
            <Modal
                title="Withdrawal Funds"
                centered
                open={openWithdrawModal}
                onOk={() => setOpenWithdrawModal(false)}
                onCancel={() => setOpenWithdrawModal(false)}
                footer={null}
                width={600}
            >
                <Tabs defaultActiveKey="manual" centered>
                    <Tabs.TabPane tab="Manual" key="manual">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleWithdraw}
                            className="mt-3"
                        >
                            <Form.Item
                                label="Amount"
                                name="amount"
                                rules={[{ required: true, message: "Please enter amount" }]}
                            >
                                <Input
                                    type="number"
                                    placeholder="Enter amount"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                />
                            </Form.Item>

                            {amount > 0 && (
                                <p className="text-gray-600 mb-3">
                                    Fee ({feePercent}%): {(amount * feePercent) / 100} |{" "}
                                    <b>Net Amount: {netAmount}</b>
                                </p>
                            )}

                            <Form.Item
                                label="Method"
                                name="method"
                                rules={[{ required: true, message: "Please select a method" }]}
                            >
                                <Select placeholder="Select deposit method">
                                    <Select.Option value={'easypaisa_manual'}>EasyPaisa</Select.Option>
                                    <Select.Option value={'jazzcash_manual'}>JazzCash</Select.Option>
                                    <Select.Option value={'bank_manual'}>Bank Transfer</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="Reason"
                                name="reason"
                                rules={[{ required: true, message: "Please enter reason" }]}
                            >
                                <Input.TextArea
                                    placeholder="Enter reason"
                                    value={reason}
                                    onChange={(e) => setWidthrawReason(e.target.value)}
                                    rows={4}
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    className="ad_listing"
                                    loading={withdrawLoading}
                                    block
                                >
                                    Submit Withdraw
                                </Button>
                            </Form.Item>
                        </Form>
                    </Tabs.TabPane>
                </Tabs>
            </Modal>

        </>
    )
}

export default Wallet