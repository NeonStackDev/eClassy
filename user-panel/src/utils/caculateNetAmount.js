'use client';
import { getCommissionApi } from "@/utils/api";

const calculateNetAmount = async (amount) => {
    const res = await getCommissionApi.getCommission();
    const feeTiers = res?.data?.data;   
    if (!amount || feeTiers.length === 0) {
        return { netAmount: 0, fee: 0 };
    }

    const tier = feeTiers.find(
        (t) => amount >= parseFloat(t.min_amount) && amount <= parseFloat(t.max_amount)
    );

    if (!tier) return { netAmount: 0, fee: 0 };

    const percent = parseFloat(tier.percentage);
    const flat = parseFloat(tier.flat_fee);
    const fee = (amount * percent) / 100 + flat;
    const netAmount = amount - fee;

    return { netAmount, fee, percent, flat };
};

export default calculateNetAmount;
