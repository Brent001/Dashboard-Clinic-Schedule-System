/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
    const res = await fetch('/api/auth/session');
    if (res.ok) {
        const session = await res.json();
        if (session.role && session.role !== 'temp') {
            return {
                status: 302,
                redirect: '/dashboard'
            };
        }
    }
    // No redirect, render login page
    return {};
};