import { AxiosRequestConfig } from 'axios';

export const configGetWithToken = (url: string): AxiosRequestConfig => {
  const localUser = localStorage.getItem('accessToken');
  return {
    method: 'get',
    url,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localUser}`
    }
  };
};

export const configPostWithoutToken = (url: string, databody: object | string): AxiosRequestConfig => ({
  method: 'post',
  url,
  headers: {
    'Content-Type': 'application/json'
  },
  data: databody
});

export const configGetWithTokenParametrized = (url: string, param: string): AxiosRequestConfig => ({
  method: 'get',
  url,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${param}`
  }
});

export const configGet = (url: string): AxiosRequestConfig => ({
  method: 'get',
  url,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const configPatchWithToken = (url: string, databody: object | string) => {
  const localUser = localStorage.getItem('accessToken');
  return {
    method: 'patch',
    url,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localUser}`
    },
    data: databody
  };
};

export const configPostWithToken = (url: string, databody: object | string) => {
  const localUser = localStorage.getItem('accessToken');
  // TODO: establecer company id en el local storage y pasarlo en el fetchwithtoken
  return {
    method: 'post',
    url,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localUser}`
    },
    data: databody
  };
};

export const configPostFileXlsx = (url: string, databody: object | string) => {
  const localUser = localStorage.getItem('accessToken');
  return {
    method: 'post',
    url,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="Response.xlsx"',
      Authorization: `Bearer ${localUser}`
    },
    data: databody
  };
};

export const configPostFileDocx = (url: string, databody: object | string) => {
  const localUser = localStorage.getItem('accessToken');
  return {
    method: 'post',
    url,
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="Response.docx"',
      Authorization: `Bearer ${localUser}`
    },
    data: databody
  };
};
export const configPostFilePdf = (url: string, databody: object | string) => {
  const localUser = localStorage.getItem('accessToken');
  return {
    method: 'post',
    url,
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="Response.pdf"',
      Authorization: `Bearer ${localUser}`
    },
    data: databody
  };
};

export const configPutWithToken = (url: string, databody: object | string) => {
  const localUser = localStorage.getItem('accessToken');
  return {
    method: 'put',
    url,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localUser}`
    },
    data: databody
  };
};

export const configDeleteWithToken = (url: string) => {
  const localUser = localStorage.getItem('accessToken');
  return {
    method: 'delete',
    url,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localUser}`
    }
  };
};
