import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('entity', () => {
    let page: AppPage;

    beforeAll(() => {
        page = new AppPage();
    });

    it('renders initial state', async () => {
        await page.navigateTo();
        const companySource = await page.getCompany();
        const company = JSON.parse(companySource);
        expect(company).toEqual(
            {
                id: 'company3',
                name: 'Company 3',
                adminId: 'user5',
                addressId: 'address2',
                address: {
                    id: 'address2',
                    name: 'Address 2',
                },
                admin: {
                    id: 'user5',
                    name: 'User 5',
                    companyId: 'company3',
                    employees: [
                        {
                            id: 'user6',
                            name: 'User 6',
                            companyId: 'company3',
                            managerId: 'user5',
                        },
                    ],
                },
                staff: [
                    {
                        id: 'user5',
                        name: 'User 5',
                        companyId: 'company3',
                        company: {
                            id: 'company3',
                            name: 'Company 3',
                            adminId: 'user5',
                            addressId: 'address2',
                            address: {
                                id: 'address2',
                                name: 'Address 2',
                                company: {
                                    id: 'company3',
                                    name: 'Company 3',
                                    adminId: 'user5',
                                    addressId: 'address2',
                                },
                            },
                        },
                    },
                    {
                        id: 'user6',
                        name: 'User 6',
                        companyId: 'company3',
                        managerId: 'user5',
                        company: {
                            id: 'company3',
                            name: 'Company 3',
                            adminId: 'user5',
                            addressId: 'address2',
                            address: {
                                id: 'address2',
                                name: 'Address 2',
                                company: {
                                    id: 'company3',
                                    name: 'Company 3',
                                    adminId: 'user5',
                                    addressId: 'address2',
                                },
                            },
                        },
                    },
                ],
            },
            'initial company data'
        );

        const usersSource = await page.getUsers();
        const users = JSON.parse(usersSource);
        expect(users).toEqual(
            [
                {
                    id: 'user1',
                    name: 'User 1',
                    companyId: 'company1',
                    employees: [
                        {
                            id: 'user2',
                            name: 'User 2',
                            companyId: 'company1',
                            managerId: 'user1',
                            manager: {
                                id: 'user1',
                                name: 'User 1',
                                companyId: 'company1',
                            },
                        },
                    ],
                },
                {
                    id: 'user3',
                    name: 'User 3',
                    companyId: 'company2',
                    employees: [
                        {
                            id: 'user4',
                            name: 'User 4',
                            companyId: 'company2',
                            managerId: 'user3',
                            manager: {
                                id: 'user3',
                                name: 'User 3',
                                companyId: 'company2',
                            },
                        },
                    ],
                },
                {
                    id: 'user6',
                    name: 'User 6',
                    companyId: 'company3',
                    managerId: 'user5',
                    employees: [],
                    manager: {
                        id: 'user5',
                        name: 'User 5',
                        companyId: 'company3',
                    },
                },
            ],
            'initial users data'
        );
    });

    it('updates a company', async () => {
        await page.clickButton('company3');

        const companySource = await page.getCompany();
        const company = JSON.parse(companySource);
        expect(company).toEqual(
            {
                id: 'company3',
                name: 'Changed Company 4',
                adminId: 'user5',
                addressId: 'address2',
                address: {
                    id: 'address2',
                    name: 'Address 2',
                },
                admin: {
                    id: 'user5',
                    name: 'User 5',
                    companyId: 'company3',
                    employees: [
                        {
                            id: 'user6',
                            name: 'User 6',
                            companyId: 'company3',
                            managerId: 'user5',
                        },
                    ],
                },
                staff: [
                    {
                        id: 'user5',
                        name: 'User 5',
                        companyId: 'company3',
                        company: {
                            id: 'company3',
                            name: 'Changed Company 4',
                            adminId: 'user5',
                            addressId: 'address2',
                            address: {
                                id: 'address2',
                                name: 'Address 2',
                                company: {
                                    id: 'company3',
                                    name: 'Changed Company 4',
                                    adminId: 'user5',
                                    addressId: 'address2',
                                },
                            },
                        },
                    },
                    {
                        id: 'user6',
                        name: 'User 6',
                        companyId: 'company3',
                        managerId: 'user5',
                        company: {
                            id: 'company3',
                            name: 'Changed Company 4',
                            adminId: 'user5',
                            addressId: 'address2',
                            address: {
                                id: 'address2',
                                name: 'Address 2',
                                company: {
                                    id: 'company3',
                                    name: 'Changed Company 4',
                                    adminId: 'user5',
                                    addressId: 'address2',
                                },
                            },
                        },
                    },
                ],
            },
            'updated company data'
        );
    });

    it('updates an address', async () => {
        await page.clickButton('address2');

        const companySource = await page.getCompany();
        const company = JSON.parse(companySource);
        expect(company).toEqual(
            {
                id: 'company3',
                name: 'Changed Company 4',
                adminId: 'user5',
                addressId: 'address2',
                address: {
                    id: 'address2',
                    name: 'Changed Address 3',
                },
                admin: {
                    id: 'user5',
                    name: 'User 5',
                    companyId: 'company3',
                    employees: [
                        {
                            id: 'user6',
                            name: 'User 6',
                            companyId: 'company3',
                            managerId: 'user5',
                        },
                    ],
                },
                staff: [
                    {
                        id: 'user5',
                        name: 'User 5',
                        companyId: 'company3',
                        company: {
                            id: 'company3',
                            name: 'Changed Company 4',
                            adminId: 'user5',
                            addressId: 'address2',
                            address: {
                                id: 'address2',
                                name: 'Changed Address 3',
                                company: {
                                    id: 'company3',
                                    name: 'Changed Company 4',
                                    adminId: 'user5',
                                    addressId: 'address2',
                                },
                            },
                        },
                    },
                    {
                        id: 'user6',
                        name: 'User 6',
                        companyId: 'company3',
                        managerId: 'user5',
                        company: {
                            id: 'company3',
                            name: 'Changed Company 4',
                            adminId: 'user5',
                            addressId: 'address2',
                            address: {
                                id: 'address2',
                                name: 'Changed Address 3',
                                company: {
                                    id: 'company3',
                                    name: 'Changed Company 4',
                                    adminId: 'user5',
                                    addressId: 'address2',
                                },
                            },
                        },
                    },
                ],
            },
            'updated address data'
        );
    });

    it('updates a user', async () => {
        await page.clickButton('user5');

        const companySource = await page.getCompany();
        const company = JSON.parse(companySource);
        expect(company).toEqual(
            {
                id: 'company3',
                name: 'Changed Company 4',
                adminId: 'user5',
                addressId: 'address2',
                address: {
                    id: 'address2',
                    name: 'Changed Address 3',
                },
                admin: {
                    id: 'user5',
                    name: 'Changed User 6',
                    companyId: 'company3',
                    employees: [
                        {
                            id: 'user6',
                            name: 'User 6',
                            companyId: 'company3',
                            managerId: 'user5',
                        },
                    ],
                },
                staff: [
                    {
                        id: 'user5',
                        name: 'Changed User 6',
                        companyId: 'company3',
                        company: {
                            id: 'company3',
                            name: 'Changed Company 4',
                            adminId: 'user5',
                            addressId: 'address2',
                            address: {
                                id: 'address2',
                                name: 'Changed Address 3',
                                company: {
                                    id: 'company3',
                                    name: 'Changed Company 4',
                                    adminId: 'user5',
                                    addressId: 'address2',
                                },
                            },
                        },
                    },
                    {
                        id: 'user6',
                        name: 'User 6',
                        companyId: 'company3',
                        managerId: 'user5',
                        company: {
                            id: 'company3',
                            name: 'Changed Company 4',
                            adminId: 'user5',
                            addressId: 'address2',
                            address: {
                                id: 'address2',
                                name: 'Changed Address 3',
                                company: {
                                    id: 'company3',
                                    name: 'Changed Company 4',
                                    adminId: 'user5',
                                    addressId: 'address2',
                                },
                            },
                        },
                    },
                ],
            },
            'updated user data'
        );

        const usersSource = await page.getUsers();
        const users = JSON.parse(usersSource);
        expect(users).toEqual(
            [
                {
                    id: 'user1',
                    name: 'User 1',
                    companyId: 'company1',
                    employees: [
                        {
                            id: 'user2',
                            name: 'User 2',
                            companyId: 'company1',
                            managerId: 'user1',
                            manager: {
                                id: 'user1',
                                name: 'User 1',
                                companyId: 'company1',
                            },
                        },
                    ],
                },
                {
                    id: 'user3',
                    name: 'User 3',
                    companyId: 'company2',
                    employees: [
                        {
                            id: 'user4',
                            name: 'User 4',
                            companyId: 'company2',
                            managerId: 'user3',
                            manager: {
                                id: 'user3',
                                name: 'User 3',
                                companyId: 'company2',
                            },
                        },
                    ],
                },
                {
                    id: 'user6',
                    name: 'User 6',
                    companyId: 'company3',
                    managerId: 'user5',
                    employees: [],
                    manager: {
                        id: 'user5',
                        name: 'Changed User 6',
                        companyId: 'company3',
                    },
                },
            ],
            'updated user data'
        );
    });

    it('updates an another user', async () => {
        await page.clickButton('user6');

        const companySource = await page.getCompany();
        const company = JSON.parse(companySource);
        expect(company).toEqual(
            {
                id: 'company3',
                name: 'Changed Company 4',
                adminId: 'user5',
                addressId: 'address2',
                address: {
                    id: 'address2',
                    name: 'Changed Address 3',
                },
                admin: {
                    id: 'user5',
                    name: 'Changed User 6',
                    companyId: 'company3',
                    employees: [
                        {
                            id: 'user6',
                            name: 'Changed User 7',
                            companyId: 'company3',
                            managerId: 'user5',
                        },
                    ],
                },
                staff: [
                    {
                        id: 'user5',
                        name: 'Changed User 6',
                        companyId: 'company3',
                        company: {
                            id: 'company3',
                            name: 'Changed Company 4',
                            adminId: 'user5',
                            addressId: 'address2',
                            address: {
                                id: 'address2',
                                name: 'Changed Address 3',
                                company: {
                                    id: 'company3',
                                    name: 'Changed Company 4',
                                    adminId: 'user5',
                                    addressId: 'address2',
                                },
                            },
                        },
                    },
                    {
                        id: 'user6',
                        name: 'Changed User 7',
                        companyId: 'company3',
                        managerId: 'user5',
                        company: {
                            id: 'company3',
                            name: 'Changed Company 4',
                            adminId: 'user5',
                            addressId: 'address2',
                            address: {
                                id: 'address2',
                                name: 'Changed Address 3',
                                company: {
                                    id: 'company3',
                                    name: 'Changed Company 4',
                                    adminId: 'user5',
                                    addressId: 'address2',
                                },
                            },
                        },
                    },
                ],
            },
            'updated user data'
        );

        const usersSource = await page.getUsers();
        const users = JSON.parse(usersSource);
        expect(users).toEqual(
            [
                {
                    id: 'user1',
                    name: 'User 1',
                    companyId: 'company1',
                    employees: [
                        {
                            id: 'user2',
                            name: 'User 2',
                            companyId: 'company1',
                            managerId: 'user1',
                            manager: {
                                id: 'user1',
                                name: 'User 1',
                                companyId: 'company1',
                            },
                        },
                    ],
                },
                {
                    id: 'user3',
                    name: 'User 3',
                    companyId: 'company2',
                    employees: [
                        {
                            id: 'user4',
                            name: 'User 4',
                            companyId: 'company2',
                            managerId: 'user3',
                            manager: {
                                id: 'user3',
                                name: 'User 3',
                                companyId: 'company2',
                            },
                        },
                    ],
                },
                {
                    id: 'user6',
                    name: 'Changed User 7',
                    companyId: 'company3',
                    managerId: 'user5',
                    employees: [],
                    manager: {
                        id: 'user5',
                        name: 'Changed User 6',
                        companyId: 'company3',
                    },
                },
            ],
            'updated user data'
        );
    });

    afterEach(async () => {
        // Assert that there are no errors emitted from the browser
        const logs = await browser.manage().logs().get(logging.Type.BROWSER);
        expect(logs).not.toContain(
            jasmine.objectContaining({
                level: logging.Level.SEVERE,
            } as logging.Entry)
        );
    });
});
