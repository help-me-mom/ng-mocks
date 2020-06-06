import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('data', () => {
    let page: AppPage;

    beforeAll(() => {
        page = new AppPage();
    });

    it('renders initial state', async () => {
        await page.navigateTo();
        const fightsSource = await page.getFights();
        const fights = JSON.parse(fightsSource);
        expect(fights).toEqual(
            [
                {
                    id: '1',
                    heroId: 'hero1',
                    villainId: 'villain4',
                    hero: {
                        uuid: 'hero1',
                        heroName: 'Hero 1',
                    },
                    villain: {
                        uuid: 'villain4',
                        villainName: 'Villain 4',
                    },
                },
                {
                    id: '2',
                    heroId: 'hero2',
                    villainId: 'villain3',
                    hero: {
                        uuid: 'hero2',
                        heroName: 'Hero 2',
                    },
                    villain: {
                        uuid: 'villain3',
                        villainName: 'Villain 3',
                    },
                },
                {
                    id: '3',
                    heroId: 'hero2',
                    villainId: 'villain4',
                    hero: {
                        uuid: 'hero2',
                        heroName: 'Hero 2',
                    },
                    villain: {
                        uuid: 'villain4',
                        villainName: 'Villain 4',
                    },
                },
            ],
            'initial fights data'
        );

        const heroesSource = await page.getHeroes();
        const heroes = JSON.parse(heroesSource);
        expect(heroes).toEqual(
            [
                {
                    uuid: 'hero1',
                    heroName: 'Hero 1',
                    fights: [
                        {
                            id: '1',
                            heroId: 'hero1',
                            villainId: 'villain4',
                            villain: {
                                uuid: 'villain4',
                                villainName: 'Villain 4',
                            },
                        },
                    ],
                },
                {
                    uuid: 'hero2',
                    heroName: 'Hero 2',
                    fights: [
                        {
                            id: '2',
                            heroId: 'hero2',
                            villainId: 'villain3',
                            villain: {
                                uuid: 'villain3',
                                villainName: 'Villain 3',
                            },
                        },
                        {
                            id: '3',
                            heroId: 'hero2',
                            villainId: 'villain4',
                            villain: {
                                uuid: 'villain4',
                                villainName: 'Villain 4',
                            },
                        },
                    ],
                },
            ],
            'initial heroes data'
        );

        const villainsSource = await page.getVillains();
        const villains = JSON.parse(villainsSource);
        expect(villains).toEqual(
            [
                {
                    uuid: 'villain3',
                    villainName: 'Villain 3',
                    fights: [
                        {
                            id: '2',
                            heroId: 'hero2',
                            villainId: 'villain3',
                            hero: {
                                uuid: 'hero2',
                                heroName: 'Hero 2',
                            },
                        },
                    ],
                },
                {
                    uuid: 'villain4',
                    villainName: 'Villain 4',
                    fights: [
                        {
                            id: '1',
                            heroId: 'hero1',
                            villainId: 'villain4',
                            hero: {
                                uuid: 'hero1',
                                heroName: 'Hero 1',
                            },
                        },
                        {
                            id: '3',
                            heroId: 'hero2',
                            villainId: 'villain4',
                            hero: {
                                uuid: 'hero2',
                                heroName: 'Hero 2',
                            },
                        },
                    ],
                },
            ],
            'initial villains data'
        );
    });

    it('updates a hero', async () => {
        await page.clickButton('hero1');

        const heroesSource = await page.getHeroes();
        const heroes = JSON.parse(heroesSource);
        expect(heroes).toEqual(
            [
                {
                    uuid: 'hero1',
                    heroName: 'Changed hero 2',
                    fights: [
                        {
                            id: '1',
                            heroId: 'hero1',
                            villainId: 'villain4',
                            villain: {
                                uuid: 'villain4',
                                villainName: 'Villain 4',
                            },
                        },
                    ],
                },
                {
                    uuid: 'hero2',
                    heroName: 'Hero 2',
                    fights: [
                        {
                            id: '2',
                            heroId: 'hero2',
                            villainId: 'villain3',
                            villain: {
                                uuid: 'villain3',
                                villainName: 'Villain 3',
                            },
                        },
                        {
                            id: '3',
                            heroId: 'hero2',
                            villainId: 'villain4',
                            villain: {
                                uuid: 'villain4',
                                villainName: 'Villain 4',
                            },
                        },
                    ],
                },
            ],
            'updated heroes data'
        );
    });

    it('updates a villain', async () => {
        await page.clickButton('villain3');

        const villainsSource = await page.getVillains();
        const villains = JSON.parse(villainsSource);
        expect(villains).toEqual(
            [
                {
                    uuid: 'villain3',
                    villainName: 'Changed villain 4',
                    fights: [
                        {
                            id: '2',
                            heroId: 'hero2',
                            villainId: 'villain3',
                            hero: {
                                uuid: 'hero2',
                                heroName: 'Hero 2',
                            },
                        },
                    ],
                },
                {
                    uuid: 'villain4',
                    villainName: 'Villain 4',
                    fights: [
                        {
                            id: '1',
                            heroId: 'hero1',
                            villainId: 'villain4',
                            hero: {
                                uuid: 'hero1',
                                heroName: 'Changed hero 2',
                            },
                        },
                        {
                            id: '3',
                            heroId: 'hero2',
                            villainId: 'villain4',
                            hero: {
                                uuid: 'hero2',
                                heroName: 'Hero 2',
                            },
                        },
                    ],
                },
            ],
            'updated villains data'
        );
    });

    it('updates an another hero', async () => {
        await page.clickButton('hero2');

        const heroesSource = await page.getHeroes();
        const heroes = JSON.parse(heroesSource);
        expect(heroes).toEqual(
            [
                {
                    uuid: 'hero1',
                    heroName: 'Changed hero 2',
                    fights: [
                        {
                            id: '1',
                            heroId: 'hero1',
                            villainId: 'villain4',
                            villain: {
                                uuid: 'villain4',
                                villainName: 'Villain 4',
                            },
                        },
                    ],
                },
                {
                    uuid: 'hero2',
                    heroName: 'Changed hero 3',
                    fights: [
                        {
                            id: '2',
                            heroId: 'hero2',
                            villainId: 'villain3',
                            villain: {
                                uuid: 'villain3',
                                villainName: 'Changed villain 4',
                            },
                        },
                        {
                            id: '3',
                            heroId: 'hero2',
                            villainId: 'villain4',
                            villain: {
                                uuid: 'villain4',
                                villainName: 'Villain 4',
                            },
                        },
                    ],
                },
            ],
            'updated heroes data'
        );
    });

    it('updates an another villain', async () => {
        await page.clickButton('villain4');

        const villainsSource = await page.getVillains();
        const villains = JSON.parse(villainsSource);
        expect(villains).toEqual(
            [
                {
                    uuid: 'villain3',
                    villainName: 'Changed villain 4',
                    fights: [
                        {
                            id: '2',
                            heroId: 'hero2',
                            villainId: 'villain3',
                            hero: {
                                uuid: 'hero2',
                                heroName: 'Changed hero 3',
                            },
                        },
                    ],
                },
                {
                    uuid: 'villain4',
                    villainName: 'Changed villain 5',
                    fights: [
                        {
                            id: '1',
                            heroId: 'hero1',
                            villainId: 'villain4',
                            hero: {
                                uuid: 'hero1',
                                heroName: 'Changed hero 2',
                            },
                        },
                        {
                            id: '3',
                            heroId: 'hero2',
                            villainId: 'villain4',
                            hero: {
                                uuid: 'hero2',
                                heroName: 'Hero 2',
                            },
                        },
                    ],
                },
            ],
            'updated villain data'
        );
    });

    it('reflects updates in fights', async () => {
        const fightsSource = await page.getFights();
        const fights = JSON.parse(fightsSource);
        expect(fights).toEqual(
            [
                {
                    id: '1',
                    heroId: 'hero1',
                    villainId: 'villain4',
                    hero: {
                        uuid: 'hero1',
                        heroName: 'Changed hero 2',
                    },
                    villain: {
                        uuid: 'villain4',
                        villainName: 'Changed villain 5',
                    },
                },
                {
                    id: '2',
                    heroId: 'hero2',
                    villainId: 'villain3',
                    hero: {
                        uuid: 'hero2',
                        heroName: 'Changed hero 3',
                    },
                    villain: {
                        uuid: 'villain3',
                        villainName: 'Changed villain 4',
                    },
                },
                {
                    id: '3',
                    heroId: 'hero2',
                    villainId: 'villain4',
                    hero: {
                        uuid: 'hero2',
                        heroName: 'Changed hero 3',
                    },
                    villain: {
                        uuid: 'villain4',
                        villainName: 'Changed villain 5',
                    },
                },
            ],
            'updated fights data'
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
