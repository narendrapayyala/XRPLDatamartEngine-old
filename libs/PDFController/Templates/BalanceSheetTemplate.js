module.exports = function (data) {
  return {
    info: {
      title: "XRPL Demo Report",
      author: "XRPL Demo",
      creator: "XRPL Demo",
      producer: "XRPL Demo",
    },
    pageSize: "A4",
    pageOrientation: "portrait",
    // pageMargins: [20, 140, 30, 60],
    background: function (currentPage, pageSize) {
      return [
        {
          canvas: [
            { type: "line", x1: 15, y1: 15, x2: 580, y2: 15, lineWidth: 1 }, //Up line
            { type: "line", x1: 15, y1: 15, x2: 15, y2: 825, lineWidth: 1 }, //Left line
            { type: "line", x1: 15, y1: 825, x2: 580, y2: 825, lineWidth: 1 }, //Bottom line
            { type: "line", x1: 580, y1: 15, x2: 580, y2: 825, lineWidth: 1 }, //Rigth line
          ],
        },
      ];
    },

    footer: function (currentPage, pageCount) {
      return [
        {
          text: "Page " + currentPage.toString() + " of " + pageCount,
          alignment: "center",
          fontSize: 8,
        },
      ];
    },
    content: getContent(data),
    styles: {
      tableExample: {
        margin: [0, 5, 0, 15],
      },
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: "black",
      },
    },
    defaultStyle: {
      columnGap: 30,
    },
  };
};

function getContent(data) {
  let content = [];
  // Main Heading block
  content.push({
    columns: [
      {
        width: 200,
        stack: [
          {
            text: "About this dataset",
            bold: true,
            fontSize: 13,
            color: "black",
            margin: [0, 0, 0, 8],
          },
          { text: "Dataset consists of balences of set of accounts." },
        ],
      },
      {
        width: "*",
        stack: [
          {
            text: "Column Descriptions",
            bold: true,
            fontSize: 13,
            color: "black",
            margin: [0, 0, 0, 8],
          },
          {
            width: "*",
            table: {
              body: [
                [
                  { text: "Address:", alignment: "left" },
                  { text: "Account address", margin: [10, 0, 0, 0] },
                ],
                [
                  { text: "Balance:", alignment: "left" },
                  {
                    text: "account balance in XRP at the time the data was requested",
                    margin: [10, 0, 0, 0],
                  },
                ],
                [
                  { text: "Ledger\u00A0Index:", alignment: "left" },
                  { text: "", margin: [10, 0, 0, 0] },
                ],
                [
                  { text: "Flags:", alignment: "left" },
                  { text: "", margin: [10, 0, 0, 0] },
                ],
              ],
              alignment: "center",
            },
            layout: "noBorders",
          },
        ],
      },
    ],
  });
  // line break
  content.push("\n\n");
  // Accounts Grid
  content.push({
    style: "tableExample",
    table: {
      headerRows: 1,
      widths: ["auto", "*", "*", "*"],
      body: getAccountRows(data),
    },
  });

  return content;
}

function getAccountRows(data) {
  let body = [
    [
      { text: "Address", style: "tableHeader", alignment: "center" },
      { text: "Balance", style: "tableHeader", alignment: "center" },
      { text: "Ledger Index", style: "tableHeader", alignment: "center" },
      { text: "Flags", style: "tableHeader", alignment: "center" },
    ],
  ];
  data.forEach((account) => {
    body.push([
      { text: account.result.account_data.Account, alignment: "center" },
      { text: account.result.account_data.Balance, alignment: "center" },
      { text: account.result.ledger_current_index, alignment: "center" },
      { text: account.result.account_data.Flags, alignment: "center" },
    ]);
  });
  return body;
}

// // playground requires you to assign document definition to a variable called dd

// var dd = {
//     pageSize: 'A4',
//     pageOrientation: 'portrait',
//     background: function (currentPage, pageSize) {
//         return [
//             {
//                 canvas: [
//                     { type: 'line', x1: 15, y1: 15, x2: 580, y2: 15, lineWidth: 1 }, //Up line
//                     { type: 'line', x1: 15, y1: 15, x2: 15, y2: 825, lineWidth: 1 }, //Left line
//                     { type: 'line', x1: 15, y1: 825, x2: 580, y2: 825, lineWidth: 1 }, //Bottom line
//                     { type: 'line', x1: 580, y1: 15, x2: 580, y2: 825, lineWidth: 1 }, //Rigth line
//                 ]
//             }
//         ]
//     },

//     footer: function (currentPage, pageCount) {
//         return [{ text: 'Page ' + currentPage.toString() + ' of ' + pageCount, alignment: 'center', fontSize:8 }];
//     },
// 	content: [
// 	    {
// // 			alignment: 'justify',
// 			columns: [
// 				{
// 				    width: 200,
//         			stack: [
//                         {text: "About this dataset", bold: true,fontSize: 13, color: 'black', margin: [0, 0, 0, 8]},
//                         {text: "Dataset consists of balences of set of accounts."},
//                     ]
// 				},
// 				{
// 				    width: '*',
// 					stack: [
//                         {text: "Column Descriptions", bold: true,fontSize: 13, color: 'black', margin: [0, 0, 0, 8]},
//                         {
//                             width: '*',
//                             table: {
//                                 body: [
//                                   [
//                                     {text: 'Address:', alignment: 'left'},
//                                     { text: "Account address", margin: [10, 0, 0, 0] }
//                                   ],
//                                   [
//                                     {text: 'Balance:', alignment: 'left'},
//                                     { text: "account balance in XRP at the time the data was requested", margin: [10, 0, 0, 0] }
//                                   ],
//                                   [
//                                     {text: 'Ledger\u00A0Index:', alignment: 'left'},
//                                     { text: "", margin: [10, 0, 0, 0] }
//                                   ],
//                                   [
//                                     {text: 'Flags:', alignment: 'left',},
//                                     { text: "", margin: [10, 0, 0, 0] }
//                                   ],
//                                 ],
//                                 alignment: "center",
//                             },
//                             layout: 'noBorders'
//                         }
//                     ]
// 				}
// 			]
// 		},

// 		'\n\n',

// 		{
// 			style: 'tableExample',
// 			table: {
// 				headerRows: 1,
// 				widths: ['auto', '*', '*', '*'],
// 				body: [
// 					[{text: 'Address', style: 'tableHeader', alignment: 'center'}, {text: 'Balance', style: 'tableHeader', alignment: 'center'}, {text: 'Ledger Index', style: 'tableHeader', alignment: 'center'}, {text: 'Flags', style: 'tableHeader', alignment: 'center'}],
// 					[
// 						{text:'rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn',alignment: "center"},
// 						{text:'424021949', alignment: "center"},
// 						{text: '67305275', alignment: "center"},
// 						{text: '9568256', alignment: "center"},
// 					]
// 				]
// 			}
// 		},
// 	],
// 	styles: {
// 		tableExample: {
// 			margin: [0, 5, 0, 15]
// 		},
// 		tableHeader: {
// 			bold: true,
// 			fontSize: 13,
// 			color: 'black'
// 		}
// 	},
// 	defaultStyle: {
// 		columnGap: 30
// 	}
// }
