import bcrypt from 'bcryptjs'
const user = [
	{
		name: "adminRishi",
		email: "rishi@admin.com",
		password: bcrypt.hashSync('rishi',10),
		isAdmin: true,
	},
	{
		name: "chotu",
		email: "chotu@fnatic.com",
		password: bcrypt.hashSync('chotu',10)
	},
	{
		name: "ankit",
		email: "ankit@ameer.com",
		password: bcrypt.hashSync('ankit',10)
	},
];

export default user