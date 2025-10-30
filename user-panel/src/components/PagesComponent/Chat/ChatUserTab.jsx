'use client'
import { formatPriceAbbreviated, formatSalaryRange, isLogin, placeholderImage, t } from "@/utils";
import { Popover, Tooltip } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { HiOutlineDotsVertical, HiOutlineShoppingCart } from "react-icons/hi";
import BuyNowModal from "./../SingleProductDetail/BuyNowModal";
import toast from "react-hot-toast";
import { itemOrderApi } from "@/utils/api";
import { useRouter } from "next/navigation";

const ChatUserTab = ({ activeTab, selectedTabData, systemSettingsData, isBlocked, handleBlockUser, handleUnBlockUser, popoverVisible, setPopoverVisible }) => {

    const isBuyingTab = activeTab === 'buying';
    const userData = isBuyingTab ? selectedTabData?.seller : selectedTabData?.buyer;
    const itemData = selectedTabData?.item;
    const profileImage = userData?.profile || systemSettingsData?.data?.data?.placeholder_image;
    const itemImage = itemData?.image || systemSettingsData?.data?.data?.placeholder_image;
    const isJobCategory = itemData?.category?.is_job_category === 1;
    const [showBuyModal, setShowBuyModal] = useState(false);
    const router = useRouter();
    const content = (userId) => (
        <div>
            {isBlocked ? (
                <p onClick={() => handleUnBlockUser(userId)} style={{ cursor: 'pointer' }}>
                    {t("unblock")}
                </p>
            ) : (
                <p onClick={() => handleBlockUser(userId)} style={{ cursor: 'pointer' }}>
                    {t("block")}
                </p>
            )}
        </div>
    );
    const handleBuyConfirm = async (orderData) => {
        
        if (!isLogin()) {
            toggleLoginModal(true);
            return;
        }
        try {
            const response = await itemOrderApi.order({
                item_id: itemData.id ?? 0,
                seller_id: userData.id ?? 0,
                totalAmount: orderData.totalAmount ?? 0,
                paymentType: orderData.paymentType ?? '',
                milestoneType: orderData.milestoneType ?? '',
                milestones: orderData.milestones ?? [],
                shippingAddress: orderData.shippingAddress ?? '',
                fullName: orderData.fullName ?? '',
                phoneNumber: orderData.phoneNumber ?? '',
            });

            const { data } = response.data;
            console.log(response);
            if (response?.data?.error) {
                return toast.error(t(response?.data?.message));
            }
            if (data?.success) {
                router.push("/order");
                return toast.success(t("Yourorderhasbeenplacedsuccessfully"));
                
            }


        } catch (error) {
            toast.error(t("unableToStartChat"));
            console.log(error);
        }

    };
    const handleBuyNow = () => {
        console.log(123);
        setShowBuyModal(true);
    }

    return (
        <div className="chat_user_tab">
            <div className="user_name_img">
                <div className="user_chat_tab_img_cont">
                    <Link href={`/seller/${userData?.id}`}>
                        <Image
                            src={profileImage}
                            alt="User"
                            width={56}
                            height={56}
                            className="user_chat_tab_img"
                            onErrorCapture={placeholderImage}
                        />
                    </Link>
                    <Image
                        src={itemImage}
                        alt="User"
                        width={24}
                        height={24}
                        className="user_chat_small_img"
                        onErrorCapture={placeholderImage} />
                </div>
                <div className="user_det">
                    <Link href={`/seller/${userData?.id}`}>
                        <h6>{userData?.name}</h6>
                    </Link>
                    <p>{itemData?.name}</p>
                </div>
                {userData?.id === selectedTabData?.seller_id && (
                    <Tooltip title="Buy Now" placement="leftTop">
                        <div className="user_det fs-1">
                            <HiOutlineShoppingCart onClick={() => handleBuyNow()} />
                        </div>
                    </Tooltip>
                )}

            </div>

            <div className="actual_price">
                <Popover content={content(userData?.id)} trigger="click" placement="bottom" visible={popoverVisible} onVisibleChange={setPopoverVisible}>
                    <span style={{ cursor: 'pointer' }}>
                        <HiOutlineDotsVertical size={22} />
                    </span>
                </Popover>
                <p className="user_chat_tab_time user_chat_money">
                    {/* {formatPriceAbbreviated(selectedTabData?.item?.price)} */}
                    {isJobCategory
                        ? formatSalaryRange(itemData?.min_salary, itemData?.max_salary)
                        : formatPriceAbbreviated(itemData?.price)}

                </p>
            </div>

            {/* Buy Now Modal */}
            <BuyNowModal
                open={showBuyModal}
                onClose={() => setShowBuyModal(false)}
                key={showBuyModal}
                showApplyModal={showBuyModal}
                OnHide={() => setShowBuyModal(false)}
                item_id={itemData}
                onConfirm={handleBuyConfirm}
                // setProductData={setProductData}
            />
        </div>
    )
}

export default ChatUserTab