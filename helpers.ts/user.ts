import { faker } from "@faker-js/faker";
import prisma from "../lib/prisma";

export async function createUser() {
    return prisma.user.create({
        data: {
            profile: {
                create: {
                    name: faker.name.fullName(),
                },
            },
        },
    });
}
