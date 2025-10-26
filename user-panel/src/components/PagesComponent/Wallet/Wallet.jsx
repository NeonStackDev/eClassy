'use client'
import BreadcrumbComponent from "@/components/Breadcrumb/BreadcrumbComponent"
import ProfileSidebar from "@/components/Profile/ProfileSidebar"
import TransactionsWallet from "@/components/Profile/TransactionsWallet"
import { CurrentLanguageData } from "@/redux/reuducer/languageSlice"
import { t } from "@/utils"
import {
    getWalletApi, putDepositApi
} from "@/utils/api";
import { useSelector } from "react-redux"
import { BsArrowUpRight, BsPlusLg } from "react-icons/bs";
import { useEffect, useState } from "react";
import {
    Modal, Tabs, Form, Input, Select, Button, Upload, message, Card,
    Typography,
} from "antd";
import { UploadOutlined, DollarCircleOutlined } from "@ant-design/icons";
const { TabPane } = Tabs;
const { Text } = Typography;


const Wallet = () => {

    const CurrentLanguage = useSelector(CurrentLanguageData)
    const [wallet, setWallet] = useState({ balance: 0, reserved_balance: 0 });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Deposit form state
    const [depositAmount, setDepositAmount] = useState("");
    const [depositFile, setDepositFile] = useState(null);
    const [depositMethod, setDepositMethod] = useState("easypaisa_manual");
    const [depositLoading, setDepositLoading] = useState(false);

    // Withdraw form state
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [withdrawMethod, setWithdrawMethod] = useState("bank");
    const [withdrawAccount, setWithdrawAccount] = useState({});
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [openDepositModal, setOpenDepositModal] = useState(false);
    const [tab, setTab] = useState("manual"); // manual or auto
    const [form] = Form.useForm();
    const [amount, setAmount] = useState(0);
    const feePercent = 5; // 5% fee
    const [file, setFile] = useState(null);
    const netAmount = amount - (amount * feePercent) / 100;
    // Load wallet & transactions
    const fetchWallet = async () => {
        setLoading(true);
        try {
            const resWallet = await getWalletApi.getWallet();
            setWallet(resWallet.data.data.wallet);            
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

    // Handle manual deposit
    async function handleDeposit(values) {
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
                type:'deposit',
                net_amount: finalData.net_amount,
                receipt: file
              });
        console.log(response);
              
        message.success("Deposit submitted successfully!");
        form.resetFields();
        setAmount(0);
        setFile(null);

        // Simulate API call
        setTimeout(() => {
            console.log("Submitted Data:", finalData);
            message.success(
                `Deposit of ${finalData.amount} (${finalData.method}) successful! Net: ${finalData.net_amount}`
            );
            setDepositLoading(false);
            setOpenDepositModal(false);
            form.resetFields();
            setAmount(0);
        }, 1500);
    };

    // Handle withdrawal
    const handleWithdraw = async (e) => {
        e.preventDefault();
        if (!withdrawAmount) return alert("Enter withdrawal amount");
        setWithdrawLoading(true);
        try {
            const res = await axios.post("/api/wallet/withdraw", {
                amount: withdrawAmount,
                method: withdrawMethod,
                account_details: withdrawAccount,
            });

            alert("Withdrawal requested, awaiting admin approval");
            setWithdrawAmount("");
            fetchWallet();
        } catch (err) {
            console.error(err);
            alert("Withdrawal failed");
        } finally {
            setWithdrawLoading(false);
        }
    };
    if (loading) return <p>Loading wallet...</p>;


    return (
        <>
            <BreadcrumbComponent title2={t('transaction')} />
            <div className='container'>
                <div className="row my_prop_title_spacing">
                    <h4 className="pop_cat_head">{t('myTransaction')}</h4>
                </div>
                <div className="row profile_sidebar">
                    <ProfileSidebar />
                    <div className="col-lg-9 p-0">
                        <div className="notif_cont  text-center">
                            <div className="row min-h-48">
                                <div className="col-sm-6 text-bg-primary p-3 justify-content-center rounded-4" >
                                    <span className="mb-20">Total Balance</span>
                                    <h2 className="mt-2">{wallet?.balance}</h2>
                                </div>
                                <div className="col-sm-6 justify-content-center">
                                    <div className=" text-bg-primary p-3 rounded-4 cursor-pointer" onClick={() => setOpenDepositModal(true)}>
                                        Deposit <BsPlusLg />
                                    </div>
                                    <div className=" text-bg-primary p-3  mt-4 rounded-4 cursor-pointer">
                                        Withraw <BsArrowUpRight />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="notif_cont">
                            <TransactionsWallet />
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

        </>
    )
}

export default Wallet