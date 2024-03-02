from dotenv import load_dotenv
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

import time
load_dotenv()
login_url = "https://ecvip.pchome.com.tw/login/v3/login.htm"
order_url = "https://ecvip.pchome.com.tw/web/order/all"
home_url = "https://ecvip.pchome.com.tw/"
username = os.getenv("username")
password = os.getenv("password")
# local_html_path = 'file://' + os.path.abspath("/home/chilung/Desktop/test_garbage/20240126_react_practice/react_practice/MobilePasswordManager/crawler_server/index.html")
The_End_page = False

options = webdriver.ChromeOptions()
options.binary_location = "/usr/bin/google-chrome-stable"
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_experimental_option("detach", True)

# # Adding headless mode to run the browser in the background
# options.add_argument("--headless")


def main():
    driver = webdriver.Chrome(options=options)

    try:
        '''
        # driver.get(local_html_path)
        '''

        driver.get(login_url)
        usernameInput = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "loginAcc"))
        )
        passwordInput = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "loginPwd"))
        )

        usernameInput.send_keys(username)
        signinBtn = driver.find_element(By.ID, "btnKeep")
        signinBtn.send_keys(Keys.ENTER)

        # 等待密碼輸入框可互動
        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "loginPwd"))
        )
        passwordInput.send_keys(password)

        signinBtn = driver.find_element(By.ID, "btnLogin")
        signinBtn.send_keys(Keys.ENTER)

        WebDriverWait(driver, 10).until(
            EC.url_to_be(home_url)
        )

        driver.get(order_url)

        # time.sleep(3)  # load order page
        # expected_conditions
        WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.ID, "listOrder"))
        )

        orders = []
        The_End_page = False


        def has_next_page_and_click(driver):
            try:
                next_page_btn = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.XPATH, '//span[@id="next_page"]/a[text()="下一頁"]'))
                )
                next_page_btn.click()

                WebDriverWait(driver, 10).until(
                    EC.visibility_of_element_located((By.ID, "listOrder"))
                )
                return True
            except:
                return False

        def extract_additional_info(order_id, driver):
            # 假設產品名稱和物流資訊位於相同的div中，並且這個div的id是根據訂單編號生成的
            div_id = f"ODD{order_id}B"  # 根據實際情況調整
            product_name = ""
            logistics_info = "None"
            # logistics_info = ""

            try:
                # 定位到包含產品名稱和物流資訊的div
                detail_div = driver.find_element(By.ID, div_id)
                # 提取產品名稱
                product_name_element = detail_div.find_element(By.CSS_SELECTOR, ".prodName_name")
                product_name = product_name_element.text
                # 提取物流資訊
                try:
                    logistics_info_element = detail_div.find_element(By.CSS_SELECTOR, ".link_logistics")
                    logistics_info = logistics_info_element.text
                except:
                    pass
            except Exception as e:
                # pass
                print(f"Error extracting additional info for order {order_id}: {e}")

            return product_name, logistics_info

        def extract_order_info(table, driver):
            orders = []
            row = table.find_element(By.CSS_SELECTOR, "tr.content_tr")
            cells = row.find_elements(By.CSS_SELECTOR, "td")
            if len(cells) < 5:
                return orders
            
            # 提取產品名稱和物流資訊
            order_id = cells[0].text
            product_name, logistics_info = extract_additional_info(order_id, driver)
            if logistics_info == "None":
                return orders

            # order_info = {}
            order_info = {
                '訂單編號': cells[0].text,
                '日期': cells[1].text,
                '訂單狀態': cells[2].text,
                '總價': cells[3].text,
                '付款': cells[4].text,
                '配送狀態': cells[5].text,
                '產品名稱': product_name,
                '物流資訊': logistics_info
            }

            orders.append(order_info)

            return orders

        def click_detail_switch_icon(driver):
            WebDriverWait(driver, 10).until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, "font.winlink.detailSwitchIcon"))
            )

            detail_buttons = driver.find_elements(By.CSS_SELECTOR, "font.winlink.detailSwitchIcon")

            for detail_button in detail_buttons:
                driver.execute_script("arguments[0].click();", detail_button)
            
            # check .prodName_name is visible
            WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, ".prodName_name"))
            )

        Has_Next_page = True

        while Has_Next_page:
            click_detail_switch_icon(driver)
            list_order_div = driver.find_element(By.ID, "listOrder")
            tables = list_order_div.find_elements(By.CSS_SELECTOR, "table.order_table_y")
            for table in tables:
                orders += extract_order_info(table, driver)
            
            # Check if the "下一頁" link exists
            Has_Next_page = has_next_page_and_click(driver)
            
        # Print the list of orders
        print(f'Total numbers of orders: {len(orders)}')
        for order in orders:
            print(order)

    except Exception as e:
        print("An error occurred:", e)

    finally:
        driver.quit()


if __name__ == "__main__":
    main()