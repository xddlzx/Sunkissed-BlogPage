// JavaScript to handle blog title clicks and show blog content
const blogTitles = document.querySelectorAll('.blog-title');
const authorElement = document.getElementById('author');
const selectedBlogTitle = document.getElementById('selected-blog-title');
const selectedBlogContent = document.getElementById('selected-blog-content');
const addBlogPopup = document.getElementById('popup'); // Assuming your popup has an ID of 'popup'

const contentBox = document.querySelector('.content-box');
const blogList = document.querySelectorAll('.blog-list');


// Adding click event listeners to each blog title
blogTitles.forEach(title => {
    title.addEventListener('click', (e) => {
        const blogIndex = e.target.getAttribute('data-index'); // Get the index of the clicked blog
        const blogTitleText = e.target.textContent;

        if (blogTitleText === 'Secret Blog 27') {
            // Add transparent effect to content box and each blog list item
            contentBox.classList.add('transparent-background');
            blogList.forEach(item => item.classList.add('transparent-background')); // Loop through each item

            // Remove the classes after a short duration
            setTimeout(() => {
                contentBox.classList.remove('transparent-background');
                blogList.forEach(item => item.classList.remove('transparent-background')); // Loop through each item
            }, 2000); // Adjust duration as needed

            // Return here to stop fetching blog content for "Blog Twenty Seven"
            return;
        }


        // Fetch the blog data from the server
        fetch(`/showBlog/${blogIndex}`)
            .then(response => response.json())
            .then(data => {
                
                if (data.error) {
                    selectedBlogTitle.textContent = 'Error loading blog';
                    selectedBlogContent.textContent = '';
                } else {
                    // Update the UI with the blog data
                    selectedBlogTitle.textContent = data.title;
                    selectedBlogContent.textContent = data.content;
                    authorElement.textContent = 'By ' + data.author;

                    // Close the Add Blog popup if it's open
                    if (addBlogPopup && addBlogPopup.style.display !== 'none') {
                        addBlogPopup.style.display = 'none';
                    }
                }
            })
            .catch(err => {
                selectedBlogTitle.textContent = 'Error loading blog';
                selectedBlogContent.textContent = '';
            });
    });
});

// Close the popup when the cancel button is clicked
document.getElementById('cancelButton').addEventListener('click', function () {
    addBlogPopup.style.display = 'none'; // Close the popup
});
