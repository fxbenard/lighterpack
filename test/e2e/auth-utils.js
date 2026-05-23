import { testRoot } from './utils';

export async function getSharedUser(page) {
    const password = 'testtest';
    const username = 'testuser';
    const email = 'testuser@lighterpack.com';

    const response = await page.request.post(`${testRoot}register`, {
        data: { username, email, password },
    });

    return { username, password, email };
}

export async function registerUser(page, username, password, email) {
    await page.goto(testRoot);

    await page.fill('.lpRegister input[name="username"]', username);
    await page.fill('.lpRegister input[name="email"]', email);
    await page.fill('.lpRegister input[name="password"]', password);
    await page.fill('.lpRegister input[name="passwordConfirm"]', password);
    await page.getByRole('button').filter({hasText: 'Register'}).click();
    await page.getByText('Start blank').click();
}

export async function registerUserWithTemplate(page, username, password, email, templateName) {
    await page.goto(testRoot);

    await page.fill('.lpRegister input[name="username"]', username);
    await page.fill('.lpRegister input[name="email"]', email);
    await page.fill('.lpRegister input[name="password"]', password);
    await page.fill('.lpRegister input[name="passwordConfirm"]', password);
    await page.getByRole('button').filter({hasText: 'Register'}).click();
    await page.getByText(templateName).waitFor();
    await page.getByText(templateName).locator('..').locator('..').getByRole('button', { name: 'Select' }).click();
}

export async function loginUser(page, username, password) {
    await page.goto(testRoot);
  
    await page.fill('.signin input[name="username"]', username);
    await page.fill('.signin input[name="password"]', password);
    await page.getByRole('button').filter({hasText: 'Sign in'}).click();
}

export async function logoutUser(page) { 
    await page.getByText('Signed in as').hover();
    await page.getByText('Sign out').click();
}