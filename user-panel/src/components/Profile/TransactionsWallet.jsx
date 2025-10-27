'use client'
import { CurrentLanguageData } from '@/redux/reuducer/languageSlice';
import { exactPrice, formatDateMonth, isLogin, t } from '@/utils';
import { getWalletTransactionApi } from '@/utils/api';
import { Table, Skeleton } from 'antd';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import UploadReceiptModal from '../PagesComponent/Transactions/UploadReceiptModal';
import { getIsLoggedIn } from '@/redux/reuducer/authSlice';

const TransactionsWallet = () => {

    
    const [IsUploadRecipt, setIsUploadRecipt] = useState(false)
    const [transactionId, setTransactionId] = useState('')
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(15);
    const isLogin = useSelector(getIsLoggedIn);



    const columns = [
        {
            title: t('date'),
            dataIndex: 'created_at',
            key: 'created_at',
            align: 'center',
            render: (text) => {
                return (
                    <span>{formatDateMonth(text)}</span>
                )
            }
        },
        {
            title: t('transactionType'),
            dataIndex: 'type',
            key: 'transactionType',
            align: 'center',
        },
        {
            title: t('transactionMode'),
            dataIndex: 'mode',
            key: 'mode',
            align: 'center',
        },
        {
            title: t('transactionMethod'),
            dataIndex: 'method',
            key: 'method',
            align: 'center',
        },
        
        {
            title: t('amount'),
            dataIndex: 'amount',
            key: 'amount',
            align: 'center',
            
        },

         {
            title: t('fee'),
            dataIndex: 'fee',
            key: 'fee',
            align: 'center',
            
        },
        {
            title: t('status'),
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (text, record) => {
                let statusClassName = '';
                switch (text) {
                    case 'approved':
                        statusClassName = 'success_status';
                        break;
                    case 'failed':
                        statusClassName = 'failed_status';
                        break;
                    case 'pending':
                        statusClassName = 'pending_status';
                        break;
                    case 'under review':
                        statusClassName = 'under_review_status';
                        break;
                    case 'rejected':
                        statusClassName = 'rejected_status';
                        break;
                    default:
                        statusClassName = '';
                        break;
                }

                return (
                    <div>

                        {record.payment_gateway === 'BankTransfer' && text === 'pending' ? (
                            <button
                                className="upload_receipt_button"
                                onClick={() => handleUploadReceipt(record.id)}
                            >
                                {t('uploadReceipt')}
                            </button>
                        )
                            :
                            <span className={statusClassName}>{text}</span>
                        }
                    </div>
                );
            },
        },
    ];

    const skeletonColumns = columns.map((col) => ({
        ...col,
        render: () => (
            <Skeleton.Input active size="default" style={{ width: '50%' }} />
        ),
    }));

        const fetchTransactions = async (page) => {
        try {
            setIsLoading(true);
            const res = await getWalletTransactionApi.getWalletTransaction({ page });
            if (res?.data?.error === false) {
                setData(res?.data?.data?.data);
                setCurrentPage(res?.data?.data?.current_page);
                setPerPage(res?.data?.data?.per_page);
                setTotalItems(res?.data?.data?.total);
            } else {
                console.error(res?.data?.message);
            }
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isLogin) {
            fetchTransactions(currentPage)
        }
    }, [currentPage, isLogin]);

  
    return (
        <>
            {isLoading ? (
                <Table
                    columns={skeletonColumns}
                    dataSource={Array.from({ length: 10 }, (_, index) => ({ key: index }))}
                    className="notif_table"
                    pagination={false}
                />
            ) : (
                <Table
                    columns={columns}
                    dataSource={data}
                    className="notif_table"
                    pagination={
                        {
                                current: currentPage,
                                pageSize: perPage,
                                total: totalItems,
                                showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total}`,
                                onChange: (page) => setCurrentPage(page),
                                showSizeChanger: false,
                                disabled: isLoading,
                        } 
                    }
                />
            )}
            <UploadReceiptModal IsUploadRecipt={IsUploadRecipt} setIsUploadRecipt={setIsUploadRecipt} transactionId={transactionId} setData={setData} />
        </>
    );
};

export default TransactionsWallet;
