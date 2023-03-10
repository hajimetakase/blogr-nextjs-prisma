import prisma from "../lib/prisma";
export async function clean() {
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.order.deleteMany();
    await prisma.user.deleteMany();
}
