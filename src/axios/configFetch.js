export const configGetWithToken = (url) => {
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

export const configGetWithTokenParametrized = (url, param) => ({
  method: 'get',
  url,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${param}`
  }
});

export const configGet = (url) => ({
  method: 'get',
  url,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const configPatchWithToken = (url, databody) => {
  const localUser = localStorage.getItem('accessToken');
  console.log(localUser);
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

export const configPostWithToken = (url, databody) => {
  const localUser = localStorage.getItem('accessToken');
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

export const configPostFileXlsx = (url, databody) => {
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

export const configPostFileDocx = (url, databody) => {
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
export const configPostFilePdf = (url, databody) => {
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

export const configPutWithToken = (url, databody) => {
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

export const configDeleteWithToken = (url) => {
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
