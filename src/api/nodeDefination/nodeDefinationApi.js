import { getFilterQuery } from "../../utils/helperFunction";
import { getApiWithToken, postApiWithToken } from "../apiInterface"

// node defination part
export const getNodeDefinationListApi = async ({setList,setListCount,filterData={},setLoading}) => {
    setLoading(true)
    let list = []
    let listCount = 0
    try {
        const query = getFilterQuery(filterData)
        const response = await getApiWithToken(`node_definition/list${query}`);

        if (response.data?.success && Array.isArray(response.data?.data)) {
            const page = response?.data?.pagination?.page || 1
            const limit = response?.data?.pagination?.limit || 50
            listCount = response?.data?.pagination?.total
            list = response.data?.data?.map((item,index)=>{
                return {
                    ...item,
                   id:item?._id,
                   sNo:((page-1)*limit)+index+1,
                   employeeId:item?.employeeId || "-",
                   fullName:item?.fullName || "-",
                   profilePic:item?.profilePic || "/assets/images/demoimg.png",
                   designation:item?.designationId?.name || "-",
                   manager:item?.reportingManagerId?.fullName || "-",
                   email:item?.email || "-",
                   password:item?.password || "-",
                   changePassword:item?.changePassword || "-",
                   phone:item?.phone || "-",
                   status:item?.isActive ? "Active" : "De-Active"
                }
            });
        } else {
            const errorMessage = `Unexpected response code: ${response.status}`;
            throw new Error(errorMessage);
        }
    } catch (error) {
        throw new Error(error?.response?.data?.message || "Failed to load nodes list");
    } finally {
        setLoading(false)
        setListCount && setListCount(listCount)
        setList && setList(list)
    }
};