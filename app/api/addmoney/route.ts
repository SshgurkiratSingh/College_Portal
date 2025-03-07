import bcrypt from 'bcrypt'
import prisma from '@/app/libs/prismadb'
import {NextResponse} from 'next/server'
import getCurrentUser from '@/app/actions/getCurrentUser';
export async function POST(
    request:Request
){
    const body = await request.json();
    console.log(body);
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({status:"error",message:"You are not logged in"});
    }
    if (!body.code || body.code.length < 6) {
        return NextResponse.json({status:"error",message:"Invalid Code"});
    }
    const codeCheck = await prisma.couponCode.findUnique({
        where:{code:body.code}
    })
    if(!codeCheck){
        return NextResponse.json({status:"error",message:"Code is invalid"});
    }
 if (codeCheck.status) {
        return NextResponse.json({status:"error",message:"Code is already used"});
    }
codeCheck.status=true;
// updating code status
try{
await prisma.couponCode.update({
    where:{code:body.code},
    data:{status:true}
})
// updating user balance
await prisma.user.update({
    where:{id:currentUser.id},
    data:{balance:currentUser.balance+codeCheck.amount}
   
})
const transactionId = Math.random().toString(36).substr(2, 9);

const history=await prisma.addMoneyHistory.create({
    data:{
 userId:currentUser.id,
 transactionId,
 Amount:codeCheck.amount,
 method:"coupon: "+codeCheck.code,
    status:"success"

    }
})
console.log(history);
}catch(e){
    return NextResponse.json({status:"error",message:"Something went wrong"});
}
const updatedBalance =currentUser.balance+codeCheck.amount;
return NextResponse.json({status:"success",message:"Code redeemed successfully, your new balance is ₹"+updatedBalance+""});
}