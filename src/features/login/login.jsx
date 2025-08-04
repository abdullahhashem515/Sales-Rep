import logo from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';


export default function Login() {
      const navigate = useNavigate();

  return (
    <>
      <div className="SeconsryColor w-screen h-screen flex items-center justify-center" dir="rtl" >
        <div className="primaryColor flex flex-col px-0 pt-0 pb-0 lg:px-8 w-[35vw] h-[90vh] rounded-2xl " >
          <div className='mt-15 mb-10'>
            <img
              alt="Your Company"
              src={logo}
              className="mx-auto h-35"
            />
          </div>

          <div className="mt-0 sm:mx-auto sm:w-full sm:max-w-sm">
            <form action="#" method="POST" className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className=" amiriFont block text-primary text-[18px]"
                >
                  اسم المستخدم
                </label>
                <div className="mt-2">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    placeholder='اسم المستخدم'
                    autoComplete="username"
                    className=" block w-full  h-[50px] bg-white/5 px-3 py-1.5 text-base text-black rounded-lg shadow-md border border-gray-200 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="amiriFont block text-primary text-[18px]"
                  >
                    كلمة السر
                  </label>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder='كلمة السر'
                    autoComplete="current-password"
                    className="block w-full h-[50px] bg-white/5 px-3 py-1.5 text-base text-black rounded-lg shadow-md border border-gray-200 placeholder:text-gray-500 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className='mt-15'>
                <button
                  onClick={() => navigate('/dashboard')}
                  type="submit"
                  className="SeconsryColor amiriFont flex w-full h-[45px] items-center justify-center rounded-lg shadow-md bg-indigo- px-3 py-1.5 mb-6 text-base font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  تسجيل
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
