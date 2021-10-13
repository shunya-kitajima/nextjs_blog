/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import Home from '../pages'

it('Should render hello text', () => {
  render(<Home />)
  expect(screen.getByText('Hello Nextjs')).toBeInTheDocument()
})
