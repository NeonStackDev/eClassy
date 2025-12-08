'use client'
import BreadcrumbComponent from "@/components/Breadcrumb/BreadcrumbComponent"
import ProfileSidebar from "@/components/Profile/ProfileSidebar"
import TransactionsWallet from "@/components/Profile/TransactionsWallet"
import { t } from "@/utils"
import {
    getWalletApi,
    putDepositApi,
    putWithdrawApi,
} from "@/utils/api";
import { BsArrowUpRight, BsPlusLg } from "react-icons/bs";
import { useEffect, useState } from "react";
import {
    Modal, Tabs, Form, Input, Select, Button, Upload, message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;

const Wallet = () => {

    const [wallet, setWallet] = useState({ balance: 0, reserved_balance: 0 });
    const [loading, setLoading] = useState(true);

    // Deposit state
    const [depositLoading, setDepositLoading] = useState(false);
    const [openDepositModal, setOpenDepositModal] = useState(false);

    // Withdraw state 
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [openWithdrawModal, setOpenWithdrawModal] = useState(false);

    const [tab, setTab] = useState("manual"); // manual / auto
    const [form] = Form.useForm();

    const [amount, setAmount] = useState(0);
    const [reason, setWithdrawReason] = useState("");
    const [feeTiers, setFeeTiers] = useState([]);
    const [feePercent, setFeePercent] = useState(0);
    const [file, setFile] = useState(null);
    const [netAmount, setNetAmount] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);
    const [depositHtml, setDepositHtml] = useState("");

    // Load wallet
    const fetchWallet = async () => {
        setLoading(true);
        try {
            const resWallet = await getWalletApi.getWallet();
            setWallet(resWallet.data.data.wallet);
            setFeeTiers(resWallet.data.data.commission)
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
        if (!amount || !feeTiers || feeTiers.length === 0) {
            setNetAmount(0);
            return;
        }

        const tier = feeTiers.find(
            (t) =>
                amount >= parseFloat(t.min_amount) &&
                amount <= parseFloat(t.max_amount)
        );

        if (!tier) {
            setNetAmount(0);
            return;
        }

        const percent = parseFloat(tier.percentage);
        const flatFee = parseFloat(tier.flat_fee);
        setFeePercent(percent);

        const fee = (amount * percent) / 100 + flatFee;
        const net = amount - fee;
        setNetAmount(net);

    }, [amount, feeTiers]);


    // Deposit
    async function handleDeposit(values) {
        try {
            const check_limit = feeTiers.find(
                (t) =>
                    amount >= parseFloat(t.min_amount) &&
                    amount <= parseFloat(t.max_amount)
            );

            if (!check_limit) {
                message.error("No fee tier found for this amount");
                return;
            }

            const fee =
                (amount * feePercent) / 100 + parseFloat(check_limit.flat_fee);

            const sendData = {
                amount: values.amount,
                method: values.method,
                fee,
                net_amount: netAmount,
                mode: tab,
                type: "deposit",
                receipt: file,
            };

            setDepositLoading(true);

            const response = await putDepositApi.putDeposit(sendData);

            if (response.data?.error === false) {
                message.success("Deposit submitted successfully!");
                form.resetFields();
                setAmount(0);
                setFile(null);
                if (sendData.mode === "auto" && response.data.data?.html) {
                    const newWindow = window.open("", "_self");
                    newWindow.document.open();
                    // Inject auto-submit script
                    const htmlWithAutoSubmit = response.data.data.html.replace(
                        /<\/form>/i,
                        `  <script>document.forms[0].submit();</script></form>`
                    );

                    newWindow.document.write(htmlWithAutoSubmit);
                    newWindow.document.close();
                }
                else {
                    //setDepositHtml(""); // clear HTML for manual mode
                    setOpenDepositModal(false);
                }

                setRefreshKey((prev) => prev + 1);

            } else {
                message.error(response.data?.message || "Deposit failed");
            }
        } catch (e) {
            console.error(e);
            message.error("Something went wrong");
        } finally {
            setDepositLoading(false);
        }
    }


    // Withdraw
    async function handleWithdraw(values) {
        const check_limit = feeTiers.find(
            (t) =>
                amount >= parseFloat(t.min_amount) &&
                amount <= parseFloat(t.max_amount)
        );
        if (!check_limit) {
            message.error("No fee tier found for this amount");
            return;
        }

        const fee = (amount * feePercent) / 100 + parseFloat(check_limit.flat_fee);

        const sendData = {
            amount: values.amount,
            method: values.method,
            fee: fee,
            net_amount: netAmount,
            reason: values.reason,
            mode: "manual",
            type: 'withdrawal',
        };

        setWithdrawLoading(true);
        await putWithdrawApi.putWithdraw(sendData);

        message.success("Withdraw submitted successfully!");
        form.resetFields();
        setAmount(0);
        setWithdrawLoading(false);
        setOpenWithdrawModal(false);
        setRefreshKey(prev => prev + 1);
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

                        {/* Balance Section */}
                        <div className="notif_cont text-center">
                            <div className="row min-h-48">
                                <div className="col-sm-6 wallet-card p-3 rounded-4">
                                    <span>Total Balance</span>
                                    <h2>{wallet?.balance}</h2>
                                </div>

                                <div className="col-sm-6">
                                    <div
                                        className="wallet-card p-3 rounded-4 cursor-pointer"
                                        onClick={() => { setOpenDepositModal(true); setTab("manual"); }}
                                    >
                                        Deposit <BsPlusLg />
                                    </div>

                                    <div
                                        className="wallet-card p-3 mt-4 rounded-4 cursor-pointer"
                                        onClick={() => setOpenWithdrawModal(true)}
                                    >
                                        Withdraw <BsArrowUpRight />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transactions */}
                        <div className="notif_cont">
                            <TransactionsWallet key={refreshKey} />
                        </div>

                    </div>
                </div>
            </div>


            {/* DEPOSIT MODAL */}
            <Modal
                title="Deposit Funds"
                centered
                open={openDepositModal}
                onCancel={() => setOpenDepositModal(false)}
                footer={null}
                width={600}
            >
                <Tabs
                    activeKey={tab}
                    onChange={(key) => setTab(key)}
                    centered
                >
                    {["manual", "auto"].map((type) => (
                        <TabPane tab={type === "manual" ? "Manual" : "Auto"} key={type}>
                            <Form form={form} layout="vertical" onFinish={handleDeposit}>

                                <Form.Item
                                    label="Amount"
                                    name="amount"
                                    rules={[{ required: true }]}
                                >
                                    <Input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                    />
                                </Form.Item>

                                {amount > 0 && (
                                    <p>
                                        Fee ({feePercent}%): {(amount * feePercent) / 100} |
                                        <b> Net: {netAmount}</b>
                                    </p>
                                )}

                                <Form.Item label="Method" name="method" rules={[{ required: true }]}>
                                    <Select>
                                        <Select.Option value={`payfast_${type}`}>
                                            PayFast {type}
                                        </Select.Option>
                                        <Select.Option value={`easypaisa_${type}`}>
                                            EasyPaisa {type}
                                        </Select.Option>
                                        <Select.Option value={`jazzcash_${type}`}>
                                            JazzCash {type}
                                        </Select.Option>
                                        <Select.Option value={`bank_${type}`}>
                                            Bank Transfer {type}
                                        </Select.Option>
                                    </Select>
                                </Form.Item>

                                {type === "manual" && (
                                    <Form.Item label="Receipt">
                                        <Upload
                                            beforeUpload={(file) => {
                                                setFile(file);
                                                return false;
                                            }}
                                            maxCount={1}
                                        >
                                            <Button icon={<UploadOutlined />}>Upload Receipt</Button>
                                        </Upload>
                                    </Form.Item>
                                )}

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={depositLoading}
                                        block
                                    >
                                        Submit Deposit
                                    </Button>
                                </Form.Item>

                            </Form>

                            {/* Render deposit HTML inside modal */}
                            {depositHtml && (
                                <div className="deposit-result mt-4 p-3 border rounded">
                                    <div dangerouslySetInnerHTML={{ __html: depositHtml }} />
                                </div>
                            )}

                        </TabPane>
                    ))}
                </Tabs>
            </Modal>



            {/* WITHDRAW MODAL */}
            <Modal
                title="Withdrawal Funds"
                centered
                open={openWithdrawModal}
                onCancel={() => setOpenWithdrawModal(false)}
                footer={null}
                width={600}
            >
                <Tabs defaultActiveKey="manual" centered>
                    <TabPane tab="Manual" key="manual">
                        <Form form={form} layout="vertical" onFinish={handleWithdraw}>

                            <Form.Item label="Amount" name="amount" rules={[{ required: true }]}>
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                />
                            </Form.Item>

                            {amount > 0 && (
                                <p>
                                    Fee ({feePercent}%): {(amount * feePercent) / 100} |
                                    <b> Net: {netAmount}</b>
                                </p>
                            )}

                            <Form.Item label="Method" name="method" rules={[{ required: true }]}>
                                <Select>
                                    <Select.Option value={'easypaisa_manual'}>EasyPaisa</Select.Option>
                                    <Select.Option value={'jazzcash_manual'}>JazzCash</Select.Option>
                                    <Select.Option value={'bank_manual'}>Bank Transfer</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item label="Reason" name="reason" rules={[{ required: true }]}>
                                <Input.TextArea
                                    value={reason}
                                    onChange={(e) => setWithdrawReason(e.target.value)}
                                    rows={4}
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={withdrawLoading}
                                    block
                                >
                                    Submit Withdraw
                                </Button>
                            </Form.Item>

                        </Form>
                    </TabPane>
                </Tabs>
            </Modal>




        </>
    )
}

export default Wallet;
