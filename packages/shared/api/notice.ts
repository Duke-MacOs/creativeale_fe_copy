import { request, gql } from 'graphql-request';
// 获取公告
export const fetchNotice = async (params: { page: number; pageSize: number; status?: string; userId?: string }) => {
  let queryData = `page:${params.page},
      pageSize: ${params.pageSize},
      sort: "updatedAt",
      sortDirection: -1
      `;
  if (params.status) {
    queryData = queryData + `status:${params.status}`;
  }
  if (params.userId) {
    queryData = queryData + `userId:"${params.userId}"`;
  }
  const query = gql`
    {
      listNoticeItem(${queryData}) {
        totalCount    
        list{
          id
          title
          content
          status
          userId
          updatedAt
          }
        }
      }
    `;
  const data = await request(`${location.origin}/api/graphql`, query).then((data: any) => data.listNoticeItem);
  return data;
};

// 更新公告
export const updateNotice = async (params: any) => {
  const queryData = `id:"${params.id}",status:${params.status},title:"${params.title}",content:"${params.content}"`;
  const query = gql`
  mutation{
    updateNoticeItem( ${queryData})
    }
  `;
  const isUpdated = await request(`${location.origin}/api/graphql`, query).then((data: any) => data.updateNoticeItem);
  return isUpdated;
};
// 新增公告
export const addNotice = async (params: any) => {
  const queryData = `title:"${params.title}",content:"${params.content}"`;
  const query = gql`
  mutation{
    addNoticeItem( ${queryData})
    }
  `;
  const isAdd = await request(`${location.origin}/api/graphql`, query).then((data: any) => data.addNoticeItem);
  return isAdd;
};
