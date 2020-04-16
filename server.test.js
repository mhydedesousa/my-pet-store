const app = require('./server')
const supertest = require('supertest')
const request = supertest(app)



it('gets the test endpoint', async done => {

  const payload = {
    address_line_one: "",
    address_line_two: "",
    city: "",
    province: "",
    postalCode: "",
    country: "",
  }
  const response = await request.post('/rates/best', payload)
  console.log(response.status)
  expect(response.status).toBe(200)
  expect(response.body.message).toBe('pass!')
  done()
})

describe("My Test",()=>{
	const mockUrl='/rates/best';
	const mockUsers=[{name:'jack',name:'jill'}];
	const getUsers = jest.fn((url)=>mockUsers)
	it("returns returns users from an api call",()=>{
		expect(getUsers(mockUrl)).toBe(mockUsers)
		console.log(getUsers)
	})
	it("called getUser with a mockUrl",()=>{
		expect(getUsers).toHaveBeenCalledWith(mockUrl)
	})
})