export const getBoards = ()=>{
    window.Trello.get('/members/me/boards', 
      (boards) => {
        console.log('成功！看板數量：', boards.length);
        console.log(boards);
      },
      (error) => {
        console.error('SDK 呼叫失敗:', error);
      }
    );
}