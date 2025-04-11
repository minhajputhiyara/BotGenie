import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'; // Fallback for backend URL

    let iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>'; // Default fallback icon

    try {
      const detailsResponse = await fetch(`${backendUrl}/api/chatbots/details/${params.id}`);
      if (detailsResponse.ok) {
        const details = await detailsResponse.json();
        if (details.icon_url) {
           // Use fetched icon URL if available
           // Style the image to fill the button (100% width/height)
           iconHtml = `<img src="${details.icon_url}" alt="Chatbot Icon" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`;
        }
      } else {
        console.warn(`Failed to fetch chatbot details (${detailsResponse.status}): ${await detailsResponse.text()}`);
      }
    } catch (fetchError) {
      console.error('Error fetching chatbot details:', fetchError);
    }

    // Create a script that will be injected into the client's website
    const widgetScript = `
      (function() {
        // Create widget container
        const widgetContainer = document.createElement('div');
        widgetContainer.id = 'chatbot-widget-container';
        widgetContainer.style.position = 'fixed';
        widgetContainer.style.bottom = '20px';
        widgetContainer.style.right = '20px';
        widgetContainer.style.zIndex = '9999';
        document.body.appendChild(widgetContainer);
        
        // Create widget button
        const widgetButton = document.createElement('button');
        widgetButton.id = 'chatbot-widget-button';
        // Set button content (fetched icon or fallback)
        widgetButton.innerHTML = '${iconHtml}';
        widgetButton.style.width = '50px';
        widgetButton.style.height = '50px';
        widgetButton.style.borderRadius = '50%';
        widgetButton.style.backgroundColor = '#4F46E5';
        widgetButton.style.color = 'white';
        widgetButton.style.border = 'none';
        widgetButton.style.cursor = 'pointer';
        widgetButton.style.display = 'flex';
        widgetButton.style.alignItems = 'center';
        widgetButton.style.justifyContent = 'center';
        widgetButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        widgetContainer.appendChild(widgetButton);
        
        // Create chat iframe (initially hidden)
        const chatIframe = document.createElement('iframe');
        chatIframe.id = 'chatbot-widget-iframe';
        chatIframe.src = '${baseUrl}/widget/${params.id}';
        chatIframe.style.position = 'fixed'; // Position iframe fixed
        chatIframe.style.bottom = '0';       // Align to bottom
        chatIframe.style.right = '0';        // Align to right
        chatIframe.style.width = 'calc(100vw / 3)'; // 1/3 viewport width
        chatIframe.style.height = '100vh';     // Full viewport height
        chatIframe.style.border = 'none'; // Remove border or set as needed
        chatIframe.style.borderRadius = '0'; // Remove border radius or adjust
        chatIframe.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        chatIframe.style.display = 'none';     // Initially hidden
        chatIframe.style.backgroundColor = 'white'; // Ensure iframe has a background
        widgetContainer.appendChild(chatIframe);
        
        // Toggle chat visibility
        widgetButton.addEventListener('click', function() {
          if (chatIframe.style.display === 'none') {
            chatIframe.style.display = 'block';
            console.log('Chatbot widget opened');
          } else {
            chatIframe.style.display = 'none';
            console.log('Chatbot widget closed');
          }
        });
        
        console.log('Chatbot widget initialized');
      })();
    `;

    // Return the script with appropriate headers
    return new NextResponse(widgetScript, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error generating widget script:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to load widget' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// Handle OPTIONS request for CORS
export function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
