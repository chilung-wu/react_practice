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
# test_url = "https://ecvip.pchome.com.tw/login/v3/login.htm"
order_url = "https://ecvip.pchome.com.tw/web/order/all"
username = os.getenv("username")
password = os.getenv("password")

The_End_page = False

# 訂單編號 日期 訂單狀態 總價 付款 配送狀態


# problemlist_url = "https://leetcode.com/problemset/all/"

options = webdriver.ChromeOptions()
options.binary_location = "/usr/bin/google-chrome-stable"
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")

# # Adding headless mode to run the browser in the background
# options.add_argument("--headless")


def main():
    driver = webdriver.Chrome(options=options)

    try:
        # Get and print the HTML source of the page
        driver.get(login_url)
        # html_source = driver.page_source
        # print(html_source)

        usernameInput = driver.find_element(By.ID, "loginAcc")
        passwordInput = driver.find_element(By.ID, "loginPwd")

        usernameInput.send_keys(username)
        signinBtn = driver.find_element(By.ID, "btnKeep")
        signinBtn.send_keys(Keys.ENTER)
        time.sleep(3)  # load password input page  

        passwordInput.send_keys(password)

        signinBtn = driver.find_element(By.ID, "btnLogin")
        signinBtn.send_keys(Keys.ENTER)

        time.sleep(3)  # redirect to home page

        driver.get(order_url)
        time.sleep(3)  # load order page

        # Initialize an empty list to store dictionaries
        orders = []
        The_End_page = False

        # Define a function to check if the "下一頁" text is present
        def has_next_page():
            try:
                driver.find_element(By.XPATH, '//span[@id="next_page"]/a[text()="下一頁"]').click()
                time.sleep(2)
                return True
            except:
                return False

        # while not The_End_page:

        Has_Next_page = True

        while Has_Next_page:

        #     next_page_link = driver.find_element(By.ID, 'next_page')
        #     if next_page_link:
        #         next_page_link.click()  # Click the link to go to the next page
        #         time.sleep(2)
        #     else:
        #         The_End_page = True  # Set the flag to end the loop
        # input("dfsdfsd???")

            # Find the div with id "listOrder"
            list_order_div = driver.find_element(By.ID, "listOrder")
            # Find all the tables with class "order_table_y" within the div
            tables = list_order_div.find_elements(By.CSS_SELECTOR, "table.order_table_y")
            # Loop through each table and extract information
            for table in tables:
                order_info = {}
                
                # Find all rows with class "content_tr" within the table
                rows = table.find_elements(By.CSS_SELECTOR, "tr.content_tr")
                
                for row in rows:
                    cells = row.find_elements(By.CSS_SELECTOR, "td")
                    
                    if (len(cells) < 5):
                        continue

                    # print(cells)

                    # Extract and store information in dictionary format
                    order_info['訂單編號'] = cells[0].text
                    # print(cells[0].text)
                    order_info['日期'] = cells[1].text
                    # print(cells[1].text)
                    order_info['訂單狀態'] = cells[2].text
                    # print(cells[2].text)
                    order_info['總價'] = cells[3].text
                    # print(cells[3].text)
                    order_info['付款'] = cells[4].text
                    # print(cells[4].text)
                    order_info['配送狀態'] = cells[5].text
                    # print(cells[5].text)

                    # Append the dictionary to the list of orders
                    orders.append(order_info)
                    # print(order_info)
            
            # Check if the "下一頁" link exists
            Has_Next_page = has_next_page()
        #     # next_page_link = driver.find_element(By.LINK_TEXT, '下一頁')
        #     next_page_link = driver.find_element(By.ID, 'next_page')
        #     if next_page_link:
        #         next_page_link.click()  # Click the link to go to the next page
        #         time.sleep(2)
        #     else:
        #         The_End_page = True  # Set the flag to end the loop
            
        # # except NoSuchElementException:
        # #     The_End_page = True  # Set the flag to end the loop
            
        # Print the list of orders
        print(f'Total numbers of orders: {len(orders)}')
        for order in orders:
            print(order)
            
        # ... rest of your code ...

    except Exception as e:
        print("An error occurred:", e)

    finally:
        driver.quit()


if __name__ == "__main__":
    main()