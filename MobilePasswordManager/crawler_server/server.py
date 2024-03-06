from flask import Flask, request, jsonify

app = Flask(__name__)

orders = [
  {'訂單編號': '20171111116972', '日期': '2017/11/11', '訂單狀態': '訂單成立', '總價': '$128', '付款': '信用卡一次付清', '配送狀態': '配送狀態', '產品名稱': 'ZMI 紫米 Type-C 傳輸充電線-100cm (AL701) 二入組', '物流資訊': '郵局 39323124205318'},
  {'訂單編號': '20170703537133', '日期': '2017/07/03', '訂單狀態': '訂單成立', '總價': '$727', '付款': '貨到付款', '配送狀態': '配送狀態', '產品名稱': 'USBX3 6A車用快充器-黑', '物流資訊': '郵局 48350510021554'},
  {'訂單編號': '20160212013687', '日期': '2016/02/12', '訂單狀態': '訂單成立', '總價': '$788', '付款': '7-11 ibon付款', '配送狀態': '配送狀態', '產品名稱': 'BUFFALO巴比祿 WHR-1166D 866+300Mbps 11ac 無線基地台', '物流資訊': '黑貓 9077491996'}
]

@app.route('/getOrders', methods=['GET'])
def get_orders():
    print('\n***********Return Orders*********\n')
    return jsonify(orders)

@app.route('/hello', methods=['POST'])
def hello_world():
    data = request.json
    message = data['message']
    response_message = message + ", World!"
    return jsonify({'message': response_message})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
