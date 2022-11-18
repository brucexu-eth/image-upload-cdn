import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import { Octokit } from "octokit";
import ReactFileReader from "react-file-reader";
import { v4 as uuidv4 } from "uuid";

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [fileInfo, setFileInfo] = useState(null);
  const octokit = useRef(null);
  const userInfo = useRef(null);

  const submitForm = async (data) => {
    console.log(data);
    if (!fileInfo) return;
    initOctokit(data.token);
    userInfo.current = await queryUser(data);
    const allImages = queryAllImage();
    console.log(allImages);
    // uploadImg();
  };

  const initOctokit = (token) => {
    const OCTOKIT = new Octokit({
      auth: token,
    });
    octokit.current = OCTOKIT;
  };

  const queryAllImage = async (data) => {
    return await octokit.current.request('GET /repos/{owner}/{repo}/contents/{path}{?ref}', {
      owner: userInfo.current.login,
      repo: "image-upload-cdn",
      path: 'public/images'
    })
  }

  const queryUser = async () => {
    try {
      const result = await octokit.current.request("GET /user", {});
      return result.data;
    } catch (err) {
      console.log(err);
    }
  };

  const uploadImg = async () => {
    const path = `public/images/${uuidv4()}.${fileInfo.fileList[0].name.split('.').pop()}`;
    await octokit.current.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner: userInfo.current.login,
      repo: "image-upload-cdn",
      path,
      message: `${userInfo.current.name}上传图片`,
      content: fileInfo.base64,
    });
  };

  const handleFiles = (file) => {
    file.base64 = file.base64.split("base64,")[1];
    setFileInfo(file);
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
            className="border-2 rounded-sm w-[100%] px-2"
          />
          {errors.token && <p className="text-rose-500">token is required.</p>}
        </div>

        <label>选择图片: </label>
        <ReactFileReader base64={true} handleFiles={handleFiles}>
          <>
          {fileInfo?.fileList[0]?.name || ""}
          <button className="btn underline ml-2">choose Image</button>
          </>
        </ReactFileReader>
        <label>地址: </label>
        <span></span>
        <button
          type="submit"
          className="col-span-2 w-[200px] m-[auto] rounded-xl border-2 py-1"
        >提交</button>
      </form>
    </div>
  );
}
export default App;
