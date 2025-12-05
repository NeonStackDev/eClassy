"use client";
import ProfileSidebar from "@/components/Profile/ProfileSidebar";
import { t } from "@/utils";
import { useEffect, useState } from "react";
import { getDisputeContentApi, postDisputeContentApi } from "@/utils/api";
import toast from "react-hot-toast";
import BreadcrumbComponent from "@/components/Breadcrumb/BreadcrumbComponent";
import { useParams } from "next/navigation";
const DisputeContents = () => {
  const [commit, setCommit] = useState("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const order_id = useParams().id;  
  const handleChange = (e) => {
    setCommit(e.target.value)
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (
        !commit?.trim()
      ) {
        toast.error(t("emptyFieldNotAllowed"));
        return;
      }
      setIsLoading(true);
      const res = await postDisputeContentApi.postDisputeContent({
        dispute_id: data?.id,
        message: commit
      });
      if (res?.data?.error === false) {
        setCommit("");
        setData(res.data.data.data);
        
      }

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(function () {
    fetchDisputeContentData()
  }, [])
  const fetchDisputeContentData = async () => {
    try {
      setIsLoading(true);
      const res = await getDisputeContentApi.getDisputeContent(order_id);
      if (res?.data?.error === false) {
        console.log(res.data.data);
        setData(res.data.data.dispute);
        console.log(data);
        
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }


  }
  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return date.toISOString().replace("T", " ").split(".")[0];
  };





  return (
    <>
      <BreadcrumbComponent title2={t("dispute")} />
      <div className="container">
        <div className="row my_prop_title_spacing">
          <h4 className="pop_cat_head">{t("myProfile")}</h4>
        </div>

        <div className="row profile_sidebar">
          <ProfileSidebar />
          <div className="col-lg-9 p-0">
            <div className="profile_content">
              <div style={{ width: "100%" }} className="address">
                <div style={{ fontSize: "1.5em" }}>{data?.order?.item?.name}Product
                  <span style={{ backgroundColor: "yellow", float: "right", fontSize: "0.5em", borderRadius: "30%", padding: "2px 5px" }}>{data?.status}</span>
                </div>
                <div style={{ fontSize: "0.7em" }}>Duspute ID:#{data?.id}</div>
                <div style={{ display: "flex", marginTop: "15px", justifyContent: "space-between" }}>
                  <div style={{ display: "inline", lineHeight: "50%" }}>
                    <p style={{ fontSize: "1em" }}>Amount in dispute</p>
                    <p style={{ fontSize: "1.3em", fontWeight: "bold" }}>{data?.order?.net_amount}</p>
                  </div>
                  <div style={{ display: "inline", lineHeight: "50%" }}>
                    <p style={{ fontSize: "1em" }}>Filed Sate</p>
                    <p style={{ fontSize: "1.3em", fontWeight: "bold" }}>
                      {formatDate(data?.created_at)}
                    </p>

                  </div>
                  <div style={{ display: "inline", lineHeight: "50%" }}>
                    <p style={{ fontSize: "1em" }}>Buyer</p>
                    <p style={{ fontSize: "1.3em", fontWeight: "bold" }}>{data?.order?.buyer?.name}</p>
                  </div>
                  <div style={{ display: "inline", lineHeight: "50%" }}>
                    <p style={{ fontSize: "1em" }}>Seller</p>
                    <p style={{ fontSize: "1.3em", fontWeight: "bold" }}>{data?.order?.seller?.name}</p>
                  </div>
                </div>
                <div style={{ lineHeight: "50%", marginTop: "3%" }}>
                  <p style={{ fontSize: "1em" }}>Description</p>
                  <p style={{ fontSize: "1.1em", fontWeight: "bold" }}>
                    {data?.description}
                  </p>
                </div>
              </div>
              <div className="address">
                <div style={{ fontSize: "1.3em", fontWeight: "bold" }}>
                  Discussion({data?.contents?.length})
                </div>

                <div style={{ width: "100%", height: "2px", backgroundColor: "black" }}></div>

                <div>
                  {data?.contents?.map((item, index) => (
                    <div key={index} style={{ marginTop: "2%", lineHeight: "50%" }}>
                      <p>
                        <span style={{ fontWeight: "bold" }}>{item.user.name}</span>                       
                        <span style={{ marginLeft: "2%" }}>
                          {new Date(item.created_at).toLocaleString("en-CA", { hour12: true })}
                        </span>
                      </p>

                      <textarea className="auth_input personal_info_input" disabled>
                        {item.message}
                      </textarea>
                    </div>
                  ))}
                </div>

              </div>
              <form onSubmit={handleSubmit}>
                <div className="">
                  <div className="">
                    <div className="">
                      <textarea
                        name="commit"
                        id="commit"
                        rows="3"
                        className="auth_input personal_info_input"
                        value={commit}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="sv_chng_btn"
                    disabled={isLoading}
                    style={{ float: "right" }}
                  >
                    {isLoading ? (
                      <div className="loader-container-otp">
                        <div className="loader-otp"></div>
                      </div>
                    ) : (
                      t("postCommit")
                    )}
                  </button>
                </div>


              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DisputeContents;
