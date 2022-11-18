import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import { Octokit } from "octokit";
import { Base64 } from "js-base64";
import ReactFileReader from "react-file-reader";

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [files, setFiles] = useState(null);
  const octokit = useRef(null);
  const userInfo = useRef(null);
  const imgInfo = useRef(null);

  const submitForm = async (data) => {
    initOctokit(data.token);
    userInfo.current = await queryUser(data);
    uploadImg();
  };

  const initOctokit = (token) => {
    const OCTOKIT = new Octokit({
      auth: token,
    });
    octokit.current = OCTOKIT;
  };

  const queryUser = async () => {
    try {
      const result = await octokit.current.request("GET /user", {});
      return result.data;
    } catch (err) {
      console.log(err);
    }
  };

  const uploadImg = async () => {
    await octokit.current.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner: userInfo.current.login,
      repo: "image-upload-cdn",
      path: `${files.fileList[0].name}`,
      message: `${userInfo.current.name}上传图片`,
      content: Base64.encode(Base64.decode(files.base64[0])),
    });
  };

  const handleFiles = (file) => {
   
    file.base64 = file.base64.map(item=>(item.split("base64,")[1]));
     console.log(file);
    setFiles(file);
  };

  return (
    <div className="w-[100vw] h-[100vh] flex justify-center items-center">
      <form
        className="grid grid-cols-[100px_300px] gap-y-6 rounded-md border-2 p-[20px]"
        onSubmit={handleSubmit(submitForm)}
      >
        <label>token: </label>
        <div>
          <input
            {...register("token", {
              required: true,
              value: "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",
            })}
            className="border-2 rounded-sm"
          />
          {errors.token && <p className="text-rose-500">token is required.</p>}
        </div>

        <label>选择图片: </label>
        <ReactFileReader base64={true} multipleFiles = { true } handleFiles={handleFiles}>
          <button className="btn underline">upload</button>
        </ReactFileReader>
        <label>地址: </label>
        <span></span>
        <input
          type="submit"
          className="col-span-2 w-[200px] m-[auto] rounded-xl border-2 py-1"
        />
      </form>
    </div>
  );
}
export default App;
