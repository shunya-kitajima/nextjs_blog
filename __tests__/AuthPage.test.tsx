/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getPage } from 'next-page-tester'
import { initTestHelpers } from 'next-page-tester/dist/testHelpers'

initTestHelpers()

process.env.NEXT_PUBLIC_RESTAPI_URL = 'http://127.0.0.1:8000/api'

const handlers = [
  rest.post(
    `${process.env.NEXT_PUBLIC_RESTAPI_URL}/jwt/create/`,
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ access: '123xyz' }))
    }
  ),
  rest.post(
    `${process.env.NEXT_PUBLIC_RESTAPI_URL}/register/`,
    (req, res, ctx) => {
      return res(ctx.status(201))
    }
  ),
  rest.get(
    `${process.env.NEXT_PUBLIC_RESTAPI_URL}/get-blogs/`,
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json([
          {
            id: 1,
            title: 'content1',
            username: 'username1',
            tags: [
              { id: 1, name: 'tag1' },
              { id: 2, name: 'tag2' },
            ],
            created_at: '2021-10-15 10:43:44',
          },
          {
            id: 2,
            title: 'content2',
            username: 'username2',
            tags: [
              { id: 1, name: 'tag1' },
              { id: 2, name: 'tag2' },
            ],
            created_at: '2021-10-15 10:43:44',
          },
        ])
      )
    }
  ),
]

const server = setupServer(...handlers)
beforeAll(() => {
  server.listen()
})
afterEach(() => {
  server.resetHandlers()
  cleanup()
})
afterAll(() => {
  server.close()
})

describe('AdminPage Test Cases', () => {
  it('Should route to index-page when login succeeded', async () => {
    const { page } = await getPage({
      route: '/admin-page',
    })
    render(page)
    expect(await screen.findByText('Login')).toBeInTheDocument()
    userEvent.type(screen.getByPlaceholderText('Username'), 'user1')
    userEvent.type(screen.getByPlaceholderText('Password'), 'user1')
    userEvent.click(screen.getByText('Login with JWT'))
    expect(await screen.findByText('blog page'))
  })
  it('Shoud not route to index-page when login is failed', async () => {
    server.use(
      rest.post(
        `${process.env.NEXT_PUBLIC_RESTAPI_URL}/jwt/create/`,
        (req, res, ctx) => {
          return res(ctx.status(400))
        }
      )
    )
    const { page } = await getPage({
      route: '/admin-page',
    })
    render(page)
    expect(await screen.findByText('Login')).toBeInTheDocument()
    userEvent.type(screen.getByPlaceholderText('Username'), 'user1')
    userEvent.type(screen.getByPlaceholderText('Password'), 'user1')
    userEvent.click(screen.getByText('Login with JWT'))
    expect(await screen.findByText('Login Error'))
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.queryByText('blog page')).toBeNull()
  })
  it('Should change to register mode', async () => {
    const { page } = await getPage({
      route: '/admin-page',
    })
    render(page)
    expect(await screen.findByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Login with JWT')).toBeInTheDocument()
    userEvent.click(screen.getByTestId('mode-change'))
    expect(screen.getByText('Sign up')).toBeInTheDocument()
    expect(screen.getByText('Create new user'))
  })
  it('Should route to index-page when register+login succeeded', async () => {
    const { page } = await getPage({
      route: '/admin-page',
    })
    render(page)
    expect(await screen.findByText('Login')).toBeInTheDocument()
    userEvent.click(screen.getByTestId('mode-change'))
    userEvent.type(screen.getByPlaceholderText('Username'), 'user1')
    userEvent.type(screen.getByPlaceholderText('Password'), 'user1')
    userEvent.click(screen.getByText('Create new user'))
    expect(await screen.findByText('blog page'))
  })
  it('Shoud not route to index-page when registration is failed', async () => {
    server.use(
      rest.post(
        `${process.env.NEXT_PUBLIC_RESTAPI_URL}/register/`,
        (req, res, ctx) => {
          return res(ctx.status(400))
        }
      )
    )
    const { page } = await getPage({
      route: '/admin-page',
    })
    render(page)
    expect(await screen.findByText('Login')).toBeInTheDocument()
    userEvent.click(screen.getByTestId('mode-change'))
    userEvent.type(screen.getByPlaceholderText('Username'), 'user1')
    userEvent.type(screen.getByPlaceholderText('Password'), 'user1')
    userEvent.click(screen.getByText('Create new user'))
    expect(await screen.findByText('Registration Error'))
    expect(screen.getByText('Sign up')).toBeInTheDocument()
    expect(screen.queryByText('blog page')).toBeNull()
  })
})
