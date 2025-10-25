'use client'
import BreadcrumbComponent from "@/components/Breadcrumb/BreadcrumbComponent"
import ProfileSidebar from "@/components/Profile/ProfileSidebar"
import TransactionsWallet from "@/components/Profile/TransactionsWallet"
import { CurrentLanguageData } from "@/redux/reuducer/languageSlice"
import { t } from "@/utils"
import {
  getWalletApi
} from "@/utils/api";
import { useSelector } from "react-redux"
import { BsArrowUpRight, BsPlusLg } from "react-icons/bs";
import { useEffect, useState } from "react";
import { Button, Flex, Modal } from 'antd';
import axios from "axios";



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

    // Load wallet & transactions
    const fetchWallet = async () => {
        setLoading(true);
        try {            
            const resWallet = await getWalletApi.getWallet();
            setWallet(resWallet.data);
            console.log(wallet);
            
            const resTx = await axios.get("/api/wallet/transactions");
            setTransactions(resTx.data.data || []);
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
    const handleDeposit = async (e) => {
        e.preventDefault();
        if (!depositAmount) return alert("Enter deposit amount");
        setDepositLoading(true);
        try {
            const formData = new FormData();
            formData.append("amount", depositAmount);
            formData.append("method", depositMethod);
            if (depositFile) formData.append("proof", depositFile);

            const res = await axios.post("/api/wallet/deposit/manual", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert("Deposit submitted, awaiting admin approval");
            setDepositAmount("");
            setDepositFile(null);
            fetchWallet();
        } catch (err) {
            console.error(err);
            alert("Deposit failed");
        } finally {
            setDepositLoading(false);
        }
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
                                    <h2 className="mt-2">1230</h2>
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
                title="Modal responsive width"
                centered
                open={openDepositModal}
                onOk={() => setOpenDepositModal(false)}
                onCancel={() => setOpenDepositModal(false)}
                width={{
                    xs: '90%',
                    sm: '80%',
                    md: '70%',
                    lg: '60%',
                    xl: '50%',
                    xxl: '40%',
                }}
            >
                <div className="mb-6 p-4 bg-green-100 rounded">
                    <h2 className="text-xl font-semibold mb-2">Deposit Funds (Manual)</h2>
                    <form onSubmit={handleDeposit} className="flex flex-col space-y-2">
                        <input
                            type="number"
                            placeholder="Amount"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            className="p-2 border rounded"
                        />
                        <select
                            value={depositMethod}
                            onChange={(e) => setDepositMethod(e.target.value)}
                            className="p-2 border rounded"
                        >
                            <option value="easypaisa_manual">EasyPaisa</option>
                            <option value="jazzcash_manual">JazzCash</option>
                            <option value="bank_manual">Bank Transfer</option>
                        </select>
                        <input
                            type="file"
                            onChange={(e) => setDepositFile(e.target.files[0])}
                            className="p-2 border rounded"
                        />
                        <button
                            type="submit"
                            disabled={depositLoading}
                            className="bg-green-500 text-white px-4 py-2 rounded"
                        >
                            {depositLoading ? "Submitting..." : "Submit Deposit"}
                        </button>
                    </form>
                </div>
            </Modal>

        </>
    )
}

export default Wallet