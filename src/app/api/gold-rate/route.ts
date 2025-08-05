import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Scrape gold and silver rates from GRT Jewels website
    let goldRate22k = null
    let silverRate = null
    
    try {
      // Fetch the GRT Jewels webpage
      const response = await fetch('https://www.grtjewels.com/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (response.ok) {
        const html = await response.text()
        
        console.log('GRT Jewels HTML length:', html.length)
        
        // Look for the dropdown button with id "dropdown-basic-button1"
        // This XPath //*[@id="dropdown-basic-button1"] translates to element with id="dropdown-basic-button1"
        const dropdownRegex = /id=["']dropdown-basic-button1["'][^>]*>([^<]*)</i
        const dropdownMatch = html.match(dropdownRegex)
        
        if (dropdownMatch) {
          console.log('Found dropdown button text:', dropdownMatch[1])
          // Extract numbers from the dropdown button text
          const buttonText = dropdownMatch[1]
          const rateRegex = /([0-9,]+(?:\.[0-9]{1,2})?)/
          const rateMatch = buttonText.match(rateRegex)
          
          if (rateMatch) {
            const rateString = rateMatch[1].replace(/,/g, '')
            const rate = parseFloat(rateString)
            if (rate > 5000 && rate < 15000) { // Reasonable gold rate range
              goldRate22k = rate
            }
          }
        }
        
        // Alternative: Look for gold rate in various patterns on GRT website
        if (!goldRate22k) {
          // Look for 22k gold rate patterns
          const patterns = [
            /(?:22\s*(?:Carat|K|Kt|CT)\s*Gold|Gold\s*22K?).*?(?:Rs\.?|₹|INR)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
            /Gold\s*Rate.*?22.*?(?:Rs\.?|₹|INR)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
            /Today.*?Gold.*?Rate.*?([6-7][0-9]{3}(?:\.[0-9]{1,2})?)/i, // Look for rates starting with 6 or 7 (realistic range)
            /"gold-rate"[^>]*>.*?([0-9,]+(?:\.[0-9]{1,2})?)/i,
            /class=["'].*?gold.*?rate.*?["'][^>]*>.*?([6-7][0-9]{3}(?:\.[0-9]{1,2})?)/i,
            /₹\s*([6-7][0-9]{3}(?:\.[0-9]{1,2})?)/g, // Look for rupee symbol followed by realistic gold rates
            />([6-7][0-9]{3})<.*?(?:gram|gm|g)/i // Look for realistic rates followed by gram units
          ]
          
          for (const pattern of patterns) {
            const match = html.match(pattern)
            if (match) {
              console.log('Pattern matched:', pattern, 'Result:', match[1])
              const rateString = match[1].replace(/,/g, '')
              const rate = parseFloat(rateString)
              if (rate > 5000 && rate < 15000) { // Reasonable gold rate range
                goldRate22k = rate
                break
              }
            }
          }
        }
        
        // Look for JSON data that might contain gold rates
        if (!goldRate22k) {
          const jsonPatterns = [
            /"goldRate":\s*"?([0-9,]+(?:\.[0-9]{1,2})?)\"?/i,
            /"price":\s*"?([6-7][0-9]{3}(?:\.[0-9]{1,2})?)\"?/i,
            /"rate":\s*"?([6-7][0-9]{3}(?:\.[0-9]{1,2})?)\"?/i
          ]
          
          for (const pattern of jsonPatterns) {
            const jsonMatch = html.match(pattern)
            if (jsonMatch) {
              console.log('JSON pattern matched:', pattern, 'Result:', jsonMatch[1])
              const rateString = jsonMatch[1].replace(/,/g, '')
              const rate = parseFloat(rateString)
              if (rate > 5000 && rate < 15000) {
                goldRate22k = rate
                break
              }
            }
          }
        }
        
        console.log('Scraped 22k gold rate from GRT:', goldRate22k)
        
        // Now look for silver rates
        // First try to find the silver dropdown button similar to gold dropdown
        const silverDropdownRegex = /id=["']dropdown-basic-button2["'][^>]*>([^<]*)</i
        const silverDropdownMatch = html.match(silverDropdownRegex)
        
        if (silverDropdownMatch) {
          console.log('Found silver dropdown button text:', silverDropdownMatch[1])
          // Extract numbers from the silver dropdown button text
          const silverButtonText = silverDropdownMatch[1]
          const silverRateRegex = /([0-9,]+(?:\.[0-9]{1,2})?)/
          const silverRateMatch = silverButtonText.match(silverRateRegex)
          
          if (silverRateMatch) {
            const rateString = silverRateMatch[1].replace(/,/g, '')
            const rate = parseFloat(rateString)
            if (rate >= 60 && rate <= 200) { // Reasonable silver rate range
              silverRate = rate
              console.log('Found silver rate from dropdown:', rate)
            }
          }
        }
        
        // If dropdown approach didn't work, try specific patterns for "SILVER 1g - ₹ X"
        if (!silverRate) {
          console.log('Trying specific SILVER 1g patterns...')
          const specificSilverPatterns = [
            // Specific pattern for GRT format: "SILVER 1g - ₹ 123"
            /SILVER\s+1g\s*-\s*₹\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
            /SILVER\s+1g\s*-\s*Rs\.?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
            // Look for silver in dropdown or button context
            /SILVER[^0-9]*([6-9][0-9]|1[0-9][0-9])(?![0-9])/i, // Silver rates 60-199
            // Alternative formats
            /SILVER.*?1g.*?₹\s*([0-9,]+(?:\.[0-9]{1,2})?)/i
          ]
          
          for (const pattern of specificSilverPatterns) {
            const match = html.match(pattern)
            if (match) {
              console.log('Specific silver pattern matched:', pattern, 'Result:', match[1], 'Full match:', match[0])
              const rateString = match[1].replace(/,/g, '')
              const rate = parseFloat(rateString)
              // Very strict range for silver - current market rates
              if (rate >= 60 && rate <= 200) { 
                silverRate = rate
                console.log('Valid silver rate found (specific search):', rate)
                break
              } else {
                console.log('Silver rate out of range (specific):', rate, 'Expected: 60-200')
              }
            }
          }
        }
        
        // Look for silver in JSON data
        if (!silverRate) {
          const silverJsonPatterns = [
            /"silverRate":\s*"?([0-9,]+(?:\.[0-9]{1,2})?)\"?/i,
            /"silver":\s*"?([5-9][0-9]{1,2}(?:\.[0-9]{1,2})?)\"?/i
          ]
          
          for (const pattern of silverJsonPatterns) {
            const jsonMatch = html.match(pattern)
            if (jsonMatch) {
              console.log('Silver JSON pattern matched:', pattern, 'Result:', jsonMatch[1])
              const rateString = jsonMatch[1].replace(/,/g, '')
              const rate = parseFloat(rateString)
              if (rate > 50 && rate < 1000) {
                silverRate = rate
                break
              }
            }
          }
        }
        
        console.log('Scraped silver rate from GRT:', silverRate)
      }
    } catch (scrapeError) {
      console.log('GRT Jewels rate scraping failed, trying fallback:', scrapeError)
    }
    
    // If scraping successful for gold, use that rate (with or without silver)
    if (goldRate22k && goldRate22k > 0) {
      const response: any = {
        success: true,
        gold: {
          rate: Math.round(goldRate22k),
          currency: 'INR',
          unit: 'gram',
          goldType: '22K'
        },
        lastUpdated: new Date().toISOString(),
        source: 'GRT Jewels Live Rate'
      }
      
      // Add silver rate if available
      if (silverRate && silverRate > 0) {
        response.silver = {
          rate: Math.round(silverRate),
          currency: 'INR',
          unit: 'gram'
        }
      }
      
      return NextResponse.json(response)
    }
    
    // Fallback: Try exchange rate calculation
    const exchangeResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    
    if (exchangeResponse.ok) {
      const exchangeData = await exchangeResponse.json()
      const goldPriceUSD = 2050 // Fallback price per troy ounce
      const usdToInr = exchangeData.rates.INR || 83
      const goldPriceINRPerGram = (goldPriceUSD * usdToInr) / 31.1035 // 1 troy ounce = 31.1035 grams
      
      // Adjust for 22k purity (22/24 = 91.67%)
      const goldRate22kFallback = goldPriceINRPerGram * (22/24)
      
      return NextResponse.json({
        success: false,
        gold: {
          rate: Math.round(goldRate22kFallback),
          currency: 'INR',
          unit: 'gram',
          goldType: '22K'
        },
        silver: {
          rate: 75, // Estimated silver rate when gold fallback is used
          currency: 'INR',
          unit: 'gram'
        },
        lastUpdated: new Date().toISOString(),
        source: 'Fallback Rate (Exchange Rate Based)',
        error: 'GRT Jewels website unavailable, using calculated rates',
        goldPriceUSD: goldPriceUSD,
        exchangeRate: usdToInr
      })
    }
    
  } catch (error) {
    console.error('Gold rate fetch error:', error)
    
    // Final fallback with static rates
    return NextResponse.json({
      success: false,
      gold: {
        rate: 6800, // Static fallback rate for 22K gold (realistic market rate)
        currency: 'INR',
        unit: 'gram',
        goldType: '22K'
      },
      silver: {
        rate: 85, // Static fallback rate for silver
        currency: 'INR',
        unit: 'gram'
      },
      lastUpdated: new Date().toISOString(),
      source: 'Static Fallback Rate',
      error: 'Unable to fetch live rates from GRT Jewels or other sources'
    }, { status: 200 }) // Return 200 to avoid breaking the UI
  }
}
