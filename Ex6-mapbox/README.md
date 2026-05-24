State:

`state`: lưu suggestions, activeIndex, selectedPlace, debounceTimer, sessionToken, map, marker — trạng thái chung cho UI và map.

Khởi tạo (init):

`document.addEventListener("DOMContentLoaded", initApp)`: entry.

`initApp()`: gọi `initMapboxMap()`, `bindEvents()`, `clearSearch(false)`.

`initMapboxMap()`: kiểm tra `MAPBOX_TOKEN` và `mapboxgl`, khởi tạo `mapboxgl.Map`, thêm `NavigationControl`, gắn sự kiện `map.on("click", ...)` để thực hiện reverse geocoding và `selectPlace()`.

Flow tìm kiếm (typing → suggestions):

`handleSearchInput()`: đọc `searchInput`, bỏ nếu <3 ký tự, đặt `state.activeIndex = -1`, dùng `debounce()` để gọi `fetchMapboxSuggestions(query)`.

`debounce(callback, delay)`: hủy timer cũ, `setTimeout` mới — tránh gọi API quá nhanh.

`fetchMapboxSuggestions(query)`: xây URL tới Mapbox suggest endpoint, thêm `access_token`, `session_token`, `limit`, `language`, `(optional) country`; trả về `data.suggestions`.

`renderSuggestions(suggestions)`: tạo DOM `li` cho mỗi suggestion, gán listener click → `selectSuggestion(index)`, và hiển thị list.

Chọn suggestion / show results:

`handleSearchKeydown(event)`: xử lý `ArrowDown`, `ArrowUp`, `Enter`, `Escape` — thay đổi `state.activeIndex`, gọi `setActiveSuggestion()` hoặc submit.

`setActiveSuggestion(index)`: cập nhật class active cho item được chọn (visual + aria).

`handleSearchSubmit() / Enter`: nếu `activeIndex >= 0` gọi `selectSuggestion`, ngược lại `showResultPanel(state.suggestions)`.

Lấy chi tiết place & cập nhật map:

`selectSuggestion(index)`: gọi `retrieveMapboxSuggestion(suggestion)`.

`retrieveMapboxSuggestion(suggestion)`: gọi endpoint retrieve với `mapbox_id`, parse `data.features[0]`.

`mapFeatureToPlace(feature, fallback)`: chuyển feature Mapbox thành object place gồm `id`, `name`, `address`, `lng`, `lat`, `featureType`, ... (dùng `formatContext`).

`selectPlace(place)`: cập nhật `state.selectedPlace`, `searchInput.value`, gọi `updateMarker(place)` và `updateInfoCard(place)`, ẩn suggestions/result panel.

`updateMarker(place)`: xóa marker cũ nếu có, tạo `mapboxgl.Marker()` mới, `setLngLat`, `addTo(map)`, `map.flyTo(...)`.

`updateInfoCard(place)`: build HTML chi tiết place (`address`, `type`, `categories`, `coords`) và hiển thị info card.

Click trên map (reverse lookup):

Khi click: `initMapboxMap` xử lý event → `fetchMapboxReversePlace(lng, lat)` → lấy feature từ reverse endpoint → `mapFeatureToPlace` → `selectPlace(place)`. Có fallback nếu reverse thất bại (`dropped-pin`).

Các hàm tiện ích:

`formatContext(context)`: trích các tên địa lý theo thứ tự (`region`, `country`, ...) để hiển thị.

`toTitleCase()`, `escapeHTML()`, `createSessionToken()`: xử lý string/XSS/session id.

Error handling & chú ý vận hành:

Kiểm tra token và `mapboxgl` trước khi khởi tạo map.

Mọi fetch kiểm tra `response.ok` và ném error nếu không ok.

`debounce` tránh spam API nhưng không cancel request cũ — có thể gây race condition.

`sessionToken` được gửi cho Mapbox để theo dõi session (tốt cho billing/accuracy).

`escapeHTML()` ngăn XSS khi chèn text vào DOM.
