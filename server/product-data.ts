import { z } from 'zod';

// Product schema
export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.string(),
  numericPrice: z.number(),
  images: z.array(z.string()),
  productUrl: z.string().optional(),
  category: z.enum(['men', 'women']),
  collections: z.array(z.string()),
  uploads: z.array(z.object({
    originalUrl: z.string(),
    ufsUrl: z.string(),
    key: z.string()
  })).optional()
});

export type Product = z.infer<typeof ProductSchema>;

// Product data with uploadthing URLs
export const products: Product[] = [
  {
    "id": 1,
    "name": "Gianna green silk dress",
    "price": "5,985",
    "numericPrice": 5985,
    "images": [
      "https://sanne.com/web/image/product.product/2804/image_1920/Gianna%20green%20silk%20dress%20%28UK6%29?unique=6035869",
      "https://sanne.com/web/image/product.image/279/image_1920/Gianna%20green%20silk%20dress?unique=ac49c22"
    ],
    "productUrl": "/shop/sanne227-gianna-green-silk-dress-483",
    "category": "women",
    "collections": [
      "New Arrivals",
      "Evening Wear",
      "Luxury"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2804/image_1920/Gianna%20green%20silk%20dress%20%28UK6%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDC0wvUyLVX4cMs27oUWvyrm3jgTzVDBGI6pnNR",
        "key": "457157622598708-1-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/279/image_1920/Gianna%20green%20silk%20dress?unique=ac49c22",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCLszEjszhQvfnEUgIcGX3H60zVkeTuiqdpBRh",
        "key": "457157622598708-1-1"
      }
    ]
  },
  {
    "id": 2,
    "name": "The Luna dress",
    "price": "5,090",
    "numericPrice": 5090,
    "images": [
      "https://sanne.com/web/image/product.product/2792/image_1920/The%20Luna%20dress%20%28UK6%29?unique=c19e08c",
      "https://sanne.com/web/image/product.image/277/image_1920/The%20Luna%20dress?unique=ce7ec27"
    ],
    "productUrl": "/shop/sanne225-the-luna-dress-481",
    "category": "women",
    "collections": [
      "New Arrivals",
      "Evening Wear"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2792/image_1920/The%20Luna%20dress%20%28UK6%29?unique=c19e08c",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCqrHmVaEJiLUGn34PkpQjdAEo9FWumHOsNhg1",
        "key": "457157623768333-2-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/277/image_1920/The%20Luna%20dress?unique=ce7ec27",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCErSUFDcmd2xr4vTOlnHFyZYwz0jbUkXQCsot",
        "key": "457157623768333-2-1"
      }
    ]
  },
  {
    "id": 3,
    "name": "Azul jeans",
    "price": "4,030",
    "numericPrice": 4030,
    "images": [
      "https://sanne.com/web/image/product.product/2798/image_1920/Azul%20jeans%20%28UK6%29?unique=c19e08c",
      "https://sanne.com/web/image/product.image/278/image_1920/Azul%20jeans?unique=d2897c9"
    ],
    "productUrl": "/shop/sanne226-azul-jeans-482",
    "category": "men",
    "collections": [
      "New Arrivals",
      "Denim"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2798/image_1920/Azul%20jeans%20%28UK6%29?unique=c19e08c",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCclJ86svSDvspglS02ObVxB7ncWorF8Xiq65a",
        "key": "457157623777625-3-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/278/image_1920/Azul%20jeans?unique=d2897c9",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCQbyNyBsiwlvNp4yXHj7nIgAbaWtFuYcZfdEM",
        "key": "457157623777625-3-1"
      }
    ]
  },
  {
    "id": 4,
    "name": "Sunset Indigo skirt",
    "price": "5,970",
    "numericPrice": 5970,
    "images": [
      "https://sanne.com/web/image/product.product/2810/image_1920/Sunset%20Indigo%20skirt%20%28UK6%29?unique=c19e08c",
      "https://sanne.com/web/image/product.image/280/image_1920/Sunset%20Indigo%20skirt?unique=0af36f3"
    ],
    "productUrl": "/shop/sanne228-sunset-indigo-skirt-484",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2810/image_1920/Sunset%20Indigo%20skirt%20%28UK6%29?unique=c19e08c",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCWAr9PrwK6lwYvrnGj7ZILaOFqHAyuxfkmDRC",
        "key": "457157623783125-4-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/280/image_1920/Sunset%20Indigo%20skirt?unique=0af36f3",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCoMjHvfLhFxDCPgQWMIaXUKS1Zjyrv4ifYOm2",
        "key": "457157623783125-4-1"
      }
    ]
  },
  {
    "id": 5,
    "name": "Malibu Midnight bohemian skirt",
    "price": "4,685",
    "numericPrice": 4685,
    "images": [
      "https://sanne.com/web/image/product.product/2786/image_1920/Malibu%20Midnight%20bohemian%20skirt%20%28UK6%29?unique=c19e08c",
      "https://sanne.com/web/image/product.image/276/image_1920/Malibu%20Midnight%20bohemian%20skirt?unique=e14ead0"
    ],
    "productUrl": "/shop/sanne224-malibu-midnight-bohemian-skirt-480",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2786/image_1920/Malibu%20Midnight%20bohemian%20skirt%20%28UK6%29?unique=c19e08c",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCVNkAFaiqtK7LUv2oQ1dSGu43fpJzAHkiReXw",
        "key": "457157623787041-5-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/276/image_1920/Malibu%20Midnight%20bohemian%20skirt?unique=e14ead0",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCvmxlgWKgv5Xdq48oPEUJ9u0Y3icCsDFnkxMA",
        "key": "457157623787041-5-1"
      }
    ]
  },
  {
    "id": 6,
    "name": "Malibu Midnight backless top",
    "price": "2,400",
    "numericPrice": 2400,
    "images": [
      "https://sanne.com/web/image/product.product/2780/image_1920/Malibu%20Midnight%20backless%20top%20%28UK6%29?unique=6035869",
      "https://sanne.com/web/image/product.image/275/image_1920/Malibu%20Midnight%20backless%20top?unique=dc1779f"
    ],
    "productUrl": "/shop/sanne223-malibu-midnight-backless-top-479",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2780/image_1920/Malibu%20Midnight%20backless%20top%20%28UK6%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDClJr6oQUm5a2MQxEBDY1OLA70hnmIqU3tJTug",
        "key": "457157623799125-6-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/275/image_1920/Malibu%20Midnight%20backless%20top?unique=dc1779f",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCp1gGTedrl4dc8VCkFzmTDYBAyG9X7UeORHtW",
        "key": "457157623799125-6-1"
      }
    ]
  },
  {
    "id": 7,
    "name": "Daydream Corset Top",
    "price": "3,585",
    "numericPrice": 3585,
    "images": [
      "https://sanne.com/web/image/product.product/2774/image_1920/Daydream%20Corset%20Top%20%28UK6%29?unique=6035869",
      "https://sanne.com/web/image/product.image/274/image_1920/Daydream%20Corset%20Top?unique=7da641e"
    ],
    "productUrl": "/shop/sanne222-daydream-corset-top-478",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2774/image_1920/Daydream%20Corset%20Top%20%28UK6%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCJaPqeIvpYMCOgdL0TcBXQZxeVuP7z5HnyvAm",
        "key": "457157623823625-7-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/274/image_1920/Daydream%20Corset%20Top?unique=7da641e",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCyF4EOK8GVkGyqRMJnH8xjPAlKhb9Crd2cw4i",
        "key": "457157623823625-7-1"
      }
    ]
  },
  {
    "id": 8,
    "name": "Terra luxe leather jacket",
    "price": "9,525",
    "numericPrice": 9525,
    "images": [
      "https://sanne.com/web/image/product.product/2762/image_1920/Terra%20luxe%20leather%20jacket%20%28UK6%29?unique=6035869",
      "https://sanne.com/web/image/product.image/272/image_1920/Terra%20luxe%20leather%20jacket?unique=e55c29a"
    ],
    "productUrl": "/shop/sanne221-terra-luxe-leather-jacket-476",
    "category": "women",
    "collections": [
      "New Arrivals",
      "Luxury"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2762/image_1920/Terra%20luxe%20leather%20jacket%20%28UK6%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCaZk3kULr6rGPFLU50jD4OcAK2bJEBaieTRdY",
        "key": "457157623828458-8-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/272/image_1920/Terra%20luxe%20leather%20jacket?unique=e55c29a",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCi7JF1TYXYT7IdJuO64st3jNz52ZamDBRoKAq",
        "key": "457157623828458-8-1"
      }
    ]
  },
  {
    "id": 9,
    "name": "Sunset Indigo jacket",
    "price": "5,375",
    "numericPrice": 5375,
    "images": [
      "https://sanne.com/web/image/product.product/2744/image_1920/Sunset%20Indigo%20jacket%20%28UK6%29?unique=6035869",
      "https://sanne.com/web/image/product.image/269/image_1920/Sunset%20Indigo%20jacket?unique=59cc364"
    ],
    "productUrl": "/shop/sanne220-sunset-indigo-jacket-473",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2744/image_1920/Sunset%20Indigo%20jacket%20%28UK6%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCN42dIOfCqDyvc4Tz58IgxEresOW9taQBXbZu",
        "key": "457157623833041-9-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/269/image_1920/Sunset%20Indigo%20jacket?unique=59cc364",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCNRontYfCqDyvc4Tz58IgxEresOW9taQBXbZu",
        "key": "457157623833041-9-1"
      }
    ]
  },
  {
    "id": 10,
    "name": "Sienna jade tweed jacket",
    "price": "7,330",
    "numericPrice": 7330,
    "images": [
      "https://sanne.com/web/image/product.product/2738/image_1920/Sienna%20jade%20tweed%20jacket%20%28UK6%29?unique=6035869",
      "https://sanne.com/web/image/product.image/268/image_1920/Sienna%20jade%20tweed%20jacket?unique=5bff2fc"
    ],
    "productUrl": "/shop/sanne219-sienna-jade-tweed-jacket-472",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2738/image_1920/Sienna%20jade%20tweed%20jacket%20%28UK6%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCO4QvXVAyFakgoVs4LzJNB3hW0lqZ7DKGw9mE",
        "key": "457157623856916-10-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/268/image_1920/Sienna%20jade%20tweed%20jacket?unique=5bff2fc",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCQxA2WRPsiwlvNp4yXHj7nIgAbaWtFuYcZfdE",
        "key": "457157623856916-10-1"
      }
    ]
  },
  {
    "id": 11,
    "name": "Santa Cruz waistcoat",
    "price": "4,320",
    "numericPrice": 4320,
    "images": [
      "https://sanne.com/web/image/product.product/2732/image_1920/Santa%20Cruz%20waistcoat%20%28UK6%29?unique=6035869",
      "https://sanne.com/web/image/product.image/267/image_1920/Santa%20Cruz%20waistcoat?unique=686dd97"
    ],
    "productUrl": "/shop/sanne218-santa-cruz-waistcoat-471",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2732/image_1920/Santa%20Cruz%20waistcoat%20%28UK6%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCc8umzzSDvspglS02ObVxB7ncWorF8Xiq65aK",
        "key": "457157623867916-11-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/267/image_1920/Santa%20Cruz%20waistcoat?unique=686dd97",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCjH97m6JBib0szdjNnXlAKIyaRPMoFC2E14vW",
        "key": "457157623867916-11-1"
      }
    ]
  },
  {
    "id": 12,
    "name": "Coastal ivory short sleeve shirt",
    "price": "2,930",
    "numericPrice": 2930,
    "images": [
      "https://sanne.com/web/image/product.product/2726/image_1920/Coastal%20ivory%20short%20sleeve%20shirt%20%28UK6%29?unique=6035869",
      "https://sanne.com/web/image/product.image/266/image_1920/Coastal%20ivory%20short%20sleeve%20shirt?unique=a493202"
    ],
    "productUrl": "/shop/sanne217-coastal-ivory-short-sleeve-shirt-470",
    "category": "men",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2726/image_1920/Coastal%20ivory%20short%20sleeve%20shirt%20%28UK6%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCZL6qb12QPkwtDIENjdYWyR5fUa9evs0FVo6l",
        "key": "457157623869416-12-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/266/image_1920/Coastal%20ivory%20short%20sleeve%20shirt?unique=a493202",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCal9CC0r6rGPFLU50jD4OcAK2bJEBaieTRdYI",
        "key": "457157623869416-12-1"
      }
    ]
  },
  {
    "id": 13,
    "name": "Laguna Blush pink tweed jacket",
    "price": "8,795",
    "numericPrice": 8795,
    "images": [
      "https://sanne.com/web/image/product.product/2720/image_1920/Laguna%20Blush%20pink%20tweed%20jacket%20%28UK6%29?unique=6035869",
      "https://sanne.com/web/image/product.image/265/image_1920/Laguna%20Blush%20pink%20tweed%20jacket?unique=67355ec"
    ],
    "productUrl": "/shop/sanne216-laguna-blush-pink-tweed-jacket-469",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2720/image_1920/Laguna%20Blush%20pink%20tweed%20jacket%20%28UK6%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCNkPwFifCqDyvc4Tz58IgxEresOW9taQBXbZu",
        "key": "457157623870500-13-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/265/image_1920/Laguna%20Blush%20pink%20tweed%20jacket?unique=67355ec",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCkhVr818oKSztsLv7VwIyP8MJYfDgdHl4pZnk",
        "key": "457157623870500-13-1"
      }
    ]
  },
  {
    "id": 14,
    "name": "Ocean Muse trousers",
    "price": "4,970",
    "numericPrice": 4970,
    "images": [
      "https://sanne.com/web/image/product.product/2714/image_1920/Ocean%20Muse%20trousers%20%28UK6%29?unique=6035869",
      "https://sanne.com/web/image/product.image/264/image_1920/Ocean%20Muse%20trousers?unique=f3301a5"
    ],
    "productUrl": "/shop/sanne215-ocean-muse-trousers-468",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2714/image_1920/Ocean%20Muse%20trousers%20%28UK6%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCmpyASBieRr4qMVvzK5OyiEPp0eLC21YJTWFD",
        "key": "457157623871416-14-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/264/image_1920/Ocean%20Muse%20trousers?unique=f3301a5",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCkkQOGoKSztsLv7VwIyP8MJYfDgdHl4pZnkC1",
        "key": "457157623871416-14-1"
      }
    ]
  },
  {
    "id": 15,
    "name": "Twilight Tide raw edge shirt",
    "price": "3,665",
    "numericPrice": 3665,
    "images": [
      "https://sanne.com/web/image/product.product/2708/image_1920/Twilight%20Tide%20raw%20edge%20shirt%20%28UK6%29?unique=6035869",
      "https://sanne.com/web/image/product.image/263/image_1920/Twilight%20Tide%20raw%20edge%20shirt?unique=2f04bf4"
    ],
    "productUrl": "/shop/sanne214-twilight-tide-raw-edge-shirt-467",
    "category": "men",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2708/image_1920/Twilight%20Tide%20raw%20edge%20shirt%20%28UK6%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCLkXqWNhQvfnEUgIcGX3H60zVkeTuiqdpBRh8",
        "key": "457157623872333-15-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/263/image_1920/Twilight%20Tide%20raw%20edge%20shirt?unique=2f04bf4",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCtooHprTmQ973VsBWjgUrwPCF6Dn8XMNpvSIT",
        "key": "457157623872333-15-1"
      }
    ]
  },
  {
    "id": 16,
    "name": "Malibu Midnight bralette top",
    "price": "3,340",
    "numericPrice": 3340,
    "images": [
      "https://sanne.com/web/image/product.product/2702/image_1920/Malibu%20Midnight%20bralette%20top%20%28UK6%29?unique=6035869",
      "https://sanne.com/web/image/product.image/260/image_1920/Malibu%20Midnight%20bralette%20top?unique=5c3e85c"
    ],
    "productUrl": "/shop/sanne213-malibu-midnight-bralette-top-466",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2702/image_1920/Malibu%20Midnight%20bralette%20top%20%28UK6%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCnmnVvQxgcL1TpAYlwXWZSn7FhatJiue2dsQE",
        "key": "457157623873208-16-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/260/image_1920/Malibu%20Midnight%20bralette%20top?unique=5c3e85c",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCED8JbMcmd2xr4vTOlnHFyZYwz0jbUkXQCsot",
        "key": "457157623873208-16-1"
      }
    ]
  },
  {
    "id": 17,
    "name": "Mocha Mirage shirt",
    "price": "4,030",
    "numericPrice": 4030,
    "images": [
      "https://sanne.com/web/image/product.product/2696/image_1920/Mocha%20Mirage%20shirt%20%28UK6%29?unique=6035869",
      "https://sanne.com/web/image/product.image/259/image_1920/Mocha%20Mirage%20shirt?unique=8ff2d81"
    ],
    "productUrl": "/shop/sanne212-mocha-mirage-shirt-465",
    "category": "men",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2696/image_1920/Mocha%20Mirage%20shirt%20%28UK6%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCJ9CUyIpYMCOgdL0TcBXQZxeVuP7z5HnyvAm9",
        "key": "457157623874125-17-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/259/image_1920/Mocha%20Mirage%20shirt?unique=8ff2d81",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCPHgGeFO3gkp8GF4silYhXvmnNCdUfz92jQuK",
        "key": "457157623874125-17-1"
      }
    ]
  },
  {
    "id": 18,
    "name": "Ash Corduroy Trench Coat",
    "price": "9,900",
    "numericPrice": 9900,
    "images": [
      "https://sanne.com/web/image/product.product/2612/image_1920/Ash%20Corduroy%20Trench%20Coat%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/5/image_1920/Ash%20Corduroy%20Trench%20Coat?unique=465350b"
    ],
    "productUrl": "/shop/sanne204-ash-corduroy-trench-coat-442",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2612/image_1920/Ash%20Corduroy%20Trench%20Coat%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCtlrG2NTmQ973VsBWjgUrwPCF6Dn8XMNpvSIT",
        "key": "457157623875791-18-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/5/image_1920/Ash%20Corduroy%20Trench%20Coat?unique=465350b",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCorDdvGLhFxDCPgQWMIaXUKS1Zjyrv4ifYOm2",
        "key": "457157623875791-18-1"
      }
    ]
  },
  {
    "id": 19,
    "name": "Frontier Fringe Flares",
    "price": "3,520",
    "numericPrice": 3520,
    "images": [
      "https://sanne.com/web/image/product.product/2492/image_1920/Frontier%20Fringe%20Flares%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/144/image_1920/Frontier%20Fringe%20Flares?unique=59b08fc"
    ],
    "productUrl": "/shop/sanne184-frontier-fringe-flares-422",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2492/image_1920/Frontier%20Fringe%20Flares%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCS1ngbH3J4LOcty0erQFDv8E6WVSoBGuPbYpI",
        "key": "457157623877125-19-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/144/image_1920/Frontier%20Fringe%20Flares?unique=59b08fc",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCFDsbIC5FLuZj7Qe6YUxVyf8twCXmdTgaDhvN",
        "key": "457157623877125-19-1"
      }
    ]
  },
  {
    "id": 20,
    "name": "Cocoa Wide Leg Trousers",
    "price": "3,090",
    "numericPrice": 3090,
    "images": [
      "https://sanne.com/web/image/product.product/2630/image_1920/Cocoa%20Wide%20Leg%20Trousers%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/10/image_1920/Cocoa%20Wide%20Leg%20Trousers?unique=8571301"
    ],
    "productUrl": "/shop/sanne207-cocoa-wide-leg-trousers-445",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2630/image_1920/Cocoa%20Wide%20Leg%20Trousers%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCtqzgWKTmQ973VsBWjgUrwPCF6Dn8XMNpvSIT",
        "key": "457157623878000-20-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/10/image_1920/Cocoa%20Wide%20Leg%20Trousers?unique=8571301",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCNv5zDcfCqDyvc4Tz58IgxEresOW9taQBXbZu",
        "key": "457157623878000-20-1"
      }
    ]
  },
  {
    "id": 21,
    "name": "Ivory Cascade Cardigan",
    "price": "4,355",
    "numericPrice": 4355,
    "images": [
      "https://sanne.com/web/image/product.product/2348/image_1920/Ivory%20Cascade%20Cardigan%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/107/image_1920/Ivory%20Cascade%20Cardigan?unique=c7e1650"
    ],
    "productUrl": "/shop/sanne160-ivory-cascade-cardigan-398",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2348/image_1920/Ivory%20Cascade%20Cardigan%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDC5QbGtX8m3v6TsZRuMln9gtICeNSWfbqEkoYz",
        "key": "457157623878875-21-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/107/image_1920/Ivory%20Cascade%20Cardigan?unique=c7e1650",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCgXq1BNjvGPhyAKj28YxrCJbXZDqm53kiWsVM",
        "key": "457157623878875-21-1"
      }
    ]
  },
  {
    "id": 22,
    "name": "Cinch &amp; Slay Corset Trouser",
    "price": "3,760",
    "numericPrice": 3760,
    "images": [
      "https://sanne.com/web/image/product.product/2534/image_1920/Cinch%20%26%20Slay%20Corset%20Trouser%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/152/image_1920/Cinch%20%26%20Slay%20Corset%20Trouser?unique=aec8526"
    ],
    "productUrl": "/shop/sanne191-cinch-slay-corset-trouser-429",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2534/image_1920/Cinch%20%26%20Slay%20Corset%20Trouser%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDC8xVc0vkuiVzghHv1ytQdb9XOIYPWnNUmr6Dk",
        "key": "457157623879750-22-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/152/image_1920/Cinch%20%26%20Slay%20Corset%20Trouser?unique=aec8526",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDClJZ5gMnm5a2MQxEBDY1OLA70hnmIqU3tJTug",
        "key": "457157623879750-22-1"
      }
    ]
  },
  {
    "id": 23,
    "name": "Cherry Quantum Bralette",
    "price": "3,920",
    "numericPrice": 3920,
    "images": [
      "https://sanne.com/web/image/product.product/2426/image_1920/Cherry%20Quantum%20Bralette%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/128/image_1920/Cherry%20Quantum%20Bralette?unique=40c2c67"
    ],
    "productUrl": "/shop/sanne173-cherry-quantum-bralette-411",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2426/image_1920/Cherry%20Quantum%20Bralette%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDC7vIhb91mtXrxQ0vPlau6R15hy48kbsWCBFci",
        "key": "457157623880625-23-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/128/image_1920/Cherry%20Quantum%20Bralette?unique=40c2c67",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDC0k2DbsVX4cMs27oUWvyrm3jgTzVDBGI6pnNR",
        "key": "457157623880625-23-1"
      }
    ]
  },
  {
    "id": 24,
    "name": "Cream Alpaca Coat",
    "price": "10,290",
    "numericPrice": 10290,
    "images": [
      "https://sanne.com/web/image/product.product/2276/image_1920/Cream%20Alpaca%20Coat%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/87/image_1920/Cyber%20Cream%20Baby%20Alpaca%20Coat?unique=b0e0555"
    ],
    "productUrl": "/shop/sanne148-cream-alpaca-coat-386",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2276/image_1920/Cream%20Alpaca%20Coat%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDChyZ95kQtxz1wWX6LClbapKOMINP9s3RJv5d7",
        "key": "457157623881500-24-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/87/image_1920/Cyber%20Cream%20Baby%20Alpaca%20Coat?unique=b0e0555",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCLsVJkGShQvfnEUgIcGX3H60zVkeTuiqdpBRh",
        "key": "457157623881500-24-1"
      }
    ]
  },
  {
    "id": 25,
    "name": "Reverie Cherry Skirt",
    "price": "3,920",
    "numericPrice": 3920,
    "images": [
      "https://sanne.com/web/image/product.product/2186/image_1920/Reverie%20Cherry%20Skirt%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/69/image_1920/Reverse%20Cherry%20Charm%20Corset%20Skirt?unique=ae13657"
    ],
    "productUrl": "/shop/sanne133-reverie-cherry-skirt-371",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2186/image_1920/Reverie%20Cherry%20Skirt%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCkNssDsoKSztsLv7VwIyP8MJYfDgdHl4pZnkC",
        "key": "457157623882375-25-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/69/image_1920/Reverse%20Cherry%20Charm%20Corset%20Skirt?unique=ae13657",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCGgntrr4GN267MkFxYc0XhIaUj3WefDHQuLbJ",
        "key": "457157623882375-25-1"
      }
    ]
  },
  {
    "id": 26,
    "name": "Chiffon Cinch Corset Top",
    "price": "3,920",
    "numericPrice": 3920,
    "images": [
      "https://sanne.com/web/image/product.product/2150/image_1920/Chiffon%20Cinch%20Corset%20Top%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/25/image_1920/Chiffon%20Cinch%20Corset%20Top?unique=3f993d9"
    ],
    "productUrl": "/shop/sanne127-chiffon-cinch-corset-top-365",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2150/image_1920/Chiffon%20Cinch%20Corset%20Top%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCPcxWITO3gkp8GF4silYhXvmnNCdUfz92jQuK",
        "key": "457157623883250-26-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/25/image_1920/Chiffon%20Cinch%20Corset%20Top?unique=3f993d9",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCFl7C065FLuZj7Qe6YUxVyf8twCXmdTgaDhvN",
        "key": "457157623883250-26-1"
      }
    ]
  },
  {
    "id": 27,
    "name": "Cherry Luxe Knit Cardigan",
    "price": "2,090",
    "numericPrice": 2090,
    "images": [
      "https://sanne.com/web/image/product.product/2414/image_1920/Cherry%20Luxe%20Knit%20Cardigan%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/126/image_1920/Cherry%20Luxe%20Knit%20Cardigan?unique=7288322"
    ],
    "productUrl": "/shop/sanne171-cherry-luxe-knit-cardigan-409",
    "category": "women",
    "collections": [
      "New Arrivals",
      "Luxury"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2414/image_1920/Cherry%20Luxe%20Knit%20Cardigan%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCS7aqLV3J4LOcty0erQFDv8E6WVSoBGuPbYpI",
        "key": "457157623884083-27-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/126/image_1920/Cherry%20Luxe%20Knit%20Cardigan?unique=7288322",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCXfloBYTbbSmA2UkocaKnGWF8BLwrYM70zPxR",
        "key": "457157623884083-27-1"
      }
    ]
  },
  {
    "id": 28,
    "name": "Nutmeg Nouveau Vest",
    "price": "4,750",
    "numericPrice": 4750,
    "images": [
      "https://sanne.com/web/image/product.product/2462/image_1920/Nutmeg%20Nouveau%20Vest%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/136/image_1920/Nutmeg%20Nouveau%20Vest?unique=e764810"
    ],
    "productUrl": "/shop/sanne179-nutmeg-nouveau-vest-417",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2462/image_1920/Nutmeg%20Nouveau%20Vest%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCkuMmMwoKSztsLv7VwIyP8MJYfDgdHl4pZnkC",
        "key": "457157623884958-28-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/136/image_1920/Nutmeg%20Nouveau%20Vest?unique=e764810",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCZBQVFZv2QPkwtDIENjdYWyR5fUa9evs0FVo6",
        "key": "457157623884958-28-1"
      }
    ]
  },
  {
    "id": 29,
    "name": "Cosmic Raglan Sleeve Jacket",
    "price": "7,520",
    "numericPrice": 7520,
    "images": [
      "https://sanne.com/web/image/product.product/2060/image_1920/Cosmic%20Raglan%20Sleeve%20Jacket%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/33/image_1920/Cosmic%20Voyage%20Raglan%20Sleeve%20Jacket?unique=e8d9e40"
    ],
    "productUrl": "/shop/sanne112-cosmic-raglan-sleeve-jacket-350",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2060/image_1920/Cosmic%20Raglan%20Sleeve%20Jacket%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCLklZjxhQvfnEUgIcGX3H60zVkeTuiqdpBRh8",
        "key": "457157623885958-29-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/33/image_1920/Cosmic%20Voyage%20Raglan%20Sleeve%20Jacket?unique=e8d9e40",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCj4mzGU6JBib0szdjNnXlAKIyaRPMoFC2E14v",
        "key": "457157623885958-29-1"
      }
    ]
  },
  {
    "id": 30,
    "name": "Lace-Up Blue Flared Denim Trousers",
    "price": "3,920",
    "numericPrice": 3920,
    "images": [
      "https://sanne.com/web/image/product.product/2204/image_1920/Lace-Up%20Blue%20Flared%20Denim%20Trousers%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/72/image_1920/Lace-Up%20Luna%20Blue%20Denim%20Flared%20Trousers%0ARegular?unique=12fbf11"
    ],
    "productUrl": "/shop/sanne136-lace-up-blue-flared-denim-trousers-374",
    "category": "women",
    "collections": [
      "New Arrivals",
      "Denim"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2204/image_1920/Lace-Up%20Blue%20Flared%20Denim%20Trousers%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCPcBaeSO3gkp8GF4silYhXvmnNCdUfz92jQuK",
        "key": "457157623886875-30-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/72/image_1920/Lace-Up%20Luna%20Blue%20Denim%20Flared%20Trousers%0ARegular?unique=12fbf11",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCr8FVQx9SQGq83NUXE1H7pLPwnuYlvxci2Kzt",
        "key": "457157623886875-30-1"
      }
    ]
  },
  {
    "id": 31,
    "name": "Stellar Waves Shorts",
    "price": "2,850",
    "numericPrice": 2850,
    "images": [
      "https://sanne.com/web/image/product.product/2030/image_1920/Stellar%20Waves%20Shorts%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/23/image_1920/Stellar%20Waves%20Shorts?unique=0164ea7"
    ],
    "productUrl": "/shop/sanne107-stellar-waves-shorts-345",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2030/image_1920/Stellar%20Waves%20Shorts%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCkR0ThioKSztsLv7VwIyP8MJYfDgdHl4pZnkC",
        "key": "457157623887750-31-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/23/image_1920/Stellar%20Waves%20Shorts?unique=0164ea7",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCG5oKBwV4GN267MkFxYc0XhIaUj3WefDHQuLb",
        "key": "457157623887750-31-1"
      }
    ]
  },
  {
    "id": 32,
    "name": "Saddleback Suede Vest",
    "price": "5,465",
    "numericPrice": 5465,
    "images": [
      "https://sanne.com/web/image/product.product/2396/image_1920/Saddleback%20Suede%20Vest%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/121/image_1920/Saddleback%20Suede%20Vest?unique=4cf2d50"
    ],
    "productUrl": "/shop/sanne168-saddleback-suede-vest-406",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2396/image_1920/Saddleback%20Suede%20Vest%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDC9fN09HZPbexcSCRhkUmTGiuvVp82BZjrDFsL",
        "key": "457157623888625-32-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/121/image_1920/Saddleback%20Suede%20Vest?unique=4cf2d50",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCLsMnrdnhQvfnEUgIcGX3H60zVkeTuiqdpBRh",
        "key": "457157623888625-32-1"
      }
    ]
  },
  {
    "id": 33,
    "name": "Astro Poplin Shirt",
    "price": "2,930",
    "numericPrice": 2930,
    "images": [
      "https://sanne.com/web/image/product.product/2006/image_1920/Astro%20Poplin%20Shirt%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/17/image_1920/Astro%20Poplin%20Shirt?unique=9876a84"
    ],
    "productUrl": "/shop/sanne103-astro-poplin-shirt-341",
    "category": "men",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2006/image_1920/Astro%20Poplin%20Shirt%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCkh617TxoKSztsLv7VwIyP8MJYfDgdHl4pZnk",
        "key": "457157623889458-33-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/17/image_1920/Astro%20Poplin%20Shirt?unique=9876a84",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDChl7gZ4Qtxz1wWX6LClbapKOMINP9s3RJv5d7",
        "key": "457157623889458-33-1"
      }
    ]
  },
  {
    "id": 34,
    "name": "Stardust Denim Jumpsuit",
    "price": "7,520",
    "numericPrice": 7520,
    "images": [
      "https://sanne.com/web/image/product.product/2084/image_1920/Stardust%20Denim%20Jumpsuit%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/41/image_1920/Stardust%20Denim%20Jumpsuit?unique=2a00b1b"
    ],
    "productUrl": "/shop/sanne116-stardust-denim-jumpsuit-354",
    "category": "women",
    "collections": [
      "New Arrivals",
      "Denim"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2084/image_1920/Stardust%20Denim%20Jumpsuit%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCsgMqSUXnVaC8wiqT7Xyz2AMbg3mJrvdEoPju",
        "key": "457157623890416-34-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/41/image_1920/Stardust%20Denim%20Jumpsuit?unique=2a00b1b",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCZg8ZTR2QPkwtDIENjdYWyR5fUa9evs0FVo6l",
        "key": "457157623890416-34-1"
      }
    ]
  },
  {
    "id": 35,
    "name": "Dune Beige Denim Trousers",
    "price": "3,800",
    "numericPrice": 3800,
    "images": [
      "https://sanne.com/web/image/product.product/2546/image_1920/Dune%20Beige%20Denim%20Trousers%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/156/image_1920/Desert%20Croc%20Beige%20Denim%20Trousers?unique=3d67044"
    ],
    "productUrl": "/shop/sanne193-dune-beige-denim-trousers-431",
    "category": "women",
    "collections": [
      "New Arrivals",
      "Denim"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2546/image_1920/Dune%20Beige%20Denim%20Trousers%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCVdKmZziqtK7LUv2oQ1dSGu43fpJzAHkiReXw",
        "key": "457157623891291-35-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/156/image_1920/Desert%20Croc%20Beige%20Denim%20Trousers?unique=3d67044",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCix3CvVYXYT7IdJuO64st3jNz52ZamDBRoKAq",
        "key": "457157623891291-35-1"
      }
    ]
  },
  {
    "id": 36,
    "name": "Nutmeg Deux Jacket",
    "price": "7,520",
    "numericPrice": 7520,
    "images": [
      "https://sanne.com/web/image/product.product/2468/image_1920/Nutmeg%20Deux%20Jacket%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/139/image_1920/Nutmeg%20Nouveau%20Double-Breasted%20Jacket?unique=5a8bc48"
    ],
    "productUrl": "/shop/sanne180-nutmeg-deux-jacket-418",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2468/image_1920/Nutmeg%20Deux%20Jacket%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCfpNISC78eo6RQXWd749HmJhGb0IkiFDMKajv",
        "key": "457157623892291-36-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/139/image_1920/Nutmeg%20Nouveau%20Double-Breasted%20Jacket?unique=5a8bc48",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCkhxrSHDoKSztsLv7VwIyP8MJYfDgdHl4pZnk",
        "key": "457157623892291-36-1"
      }
    ]
  },
  {
    "id": 37,
    "name": "Nomad Bomber Jacket",
    "price": "3,720",
    "numericPrice": 3720,
    "images": [
      "https://sanne.com/web/image/product.product/2648/image_1920/Nomad%20Bomber%20Jacket%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/1/image_1920/Nomad%20Bomber%20Jacket?unique=56c14d9"
    ],
    "productUrl": "/shop/sanne210-nomad-bomber-jacket-448",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2648/image_1920/Nomad%20Bomber%20Jacket%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCyn3JLDGVkGyqRMJnH8xjPAlKhb9Crd2cw4iS",
        "key": "457157623893166-37-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/1/image_1920/Nomad%20Bomber%20Jacket?unique=56c14d9",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCLsABG0AhQvfnEUgIcGX3H60zVkeTuiqdpBRh",
        "key": "457157623893166-37-1"
      }
    ]
  },
  {
    "id": 38,
    "name": "Maple Cordy Lace-Up Coat",
    "price": "7,720",
    "numericPrice": 7720,
    "images": [
      "https://sanne.com/web/image/product.product/2594/image_1920/Maple%20Cordy%20Lace-Up%20Coat%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/11/image_1920/Chestnut%20Corduroy%20Lace-Up%20Coat?unique=17518d3"
    ],
    "productUrl": "/shop/sanne201-maple-cordy-lace-up-coat-439",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2594/image_1920/Maple%20Cordy%20Lace-Up%20Coat%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCidnzCGYXYT7IdJuO64st3jNz52ZamDBRoKAq",
        "key": "457157623894000-38-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/11/image_1920/Chestnut%20Corduroy%20Lace-Up%20Coat?unique=17518d3",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCkTv86KoKSztsLv7VwIyP8MJYfDgdHl4pZnkC",
        "key": "457157623894000-38-1"
      }
    ]
  },
  {
    "id": 39,
    "name": "Lace-Up Brown Denim Flared Trousers",
    "price": "3,920",
    "numericPrice": 3920,
    "images": [
      "https://sanne.com/web/image/product.product/2210/image_1920/Lace-Up%20Brown%20Denim%20Flared%20Trousers%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/71/image_1920/Lace-Up%20Luna%20Brown%20Denim%20Flared%20Trousers?unique=8f2b340"
    ],
    "productUrl": "/shop/sanne137-lace-up-brown-denim-flared-trousers-375",
    "category": "women",
    "collections": [
      "New Arrivals",
      "Denim"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2210/image_1920/Lace-Up%20Brown%20Denim%20Flared%20Trousers%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCZjrxuu2QPkwtDIENjdYWyR5fUa9evs0FVo6l",
        "key": "457157623894833-39-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/71/image_1920/Lace-Up%20Luna%20Brown%20Denim%20Flared%20Trousers?unique=8f2b340",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDC9EbHqBZPbexcSCRhkUmTGiuvVp82BZjrDFsL",
        "key": "457157623894833-39-1"
      }
    ]
  },
  {
    "id": 40,
    "name": "Cosmic Cropped Jacket",
    "price": "7,125",
    "numericPrice": 7125,
    "images": [
      "https://sanne.com/web/image/product.product/2258/image_1920/Cosmic%20Cropped%20Jacket%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/84/image_1920/Cosmic%20Voyage%20Cropped%20Jacket?unique=0e334ad"
    ],
    "productUrl": "/shop/sanne145-cosmic-cropped-jacket-383",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2258/image_1920/Cosmic%20Cropped%20Jacket%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCiyc2bIYXYT7IdJuO64st3jNz52ZamDBRoKAq",
        "key": "457157623895750-40-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/84/image_1920/Cosmic%20Voyage%20Cropped%20Jacket?unique=0e334ad",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCZBok6352QPkwtDIENjdYWyR5fUa9evs0FVo6",
        "key": "457157623895750-40-1"
      }
    ]
  },
  {
    "id": 41,
    "name": "Khaki Trails Jacket",
    "price": "7,880",
    "numericPrice": 7880,
    "images": [
      "https://sanne.com/web/image/product.product/2570/image_1920/Khaki%20Trails%20Jacket%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/163/image_1920/Khaki%20Trails%20Jacket?unique=6a220de"
    ],
    "productUrl": "/shop/sanne197-khaki-trails-jacket-435",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2570/image_1920/Khaki%20Trails%20Jacket%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCb38dZ7NY74yEISs32Qmvcp5dzFTP9keqnxKr",
        "key": "457157623896625-41-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/163/image_1920/Khaki%20Trails%20Jacket?unique=6a220de",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCtRiKK2TmQ973VsBWjgUrwPCF6Dn8XMNpvSIT",
        "key": "457157623896625-41-1"
      }
    ]
  },
  {
    "id": 42,
    "name": "Moss Suede Skirt",
    "price": "4,750",
    "numericPrice": 4750,
    "images": [
      "https://sanne.com/web/image/product.product/2588/image_1920/Moss%20Suede%20Skirt%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/7/image_1920/Moss%20Suede%20Skirt?unique=5bc8276"
    ],
    "productUrl": "/shop/sanne200-moss-suede-skirt-438",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2588/image_1920/Moss%20Suede%20Skirt%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCnjjVGT2xgcL1TpAYlwXWZSn7FhatJiue2dsQ",
        "key": "457157623897875-42-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/7/image_1920/Moss%20Suede%20Skirt?unique=5bc8276",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDC89PdVXkuiVzghHv1ytQdb9XOIYPWnNUmr6Dk",
        "key": "457157623897875-42-1"
      }
    ]
  },
  {
    "id": 43,
    "name": "Indigo Stardust Abaya",
    "price": "6,730",
    "numericPrice": 6730,
    "images": [
      "https://sanne.com/web/image/product.product/2066/image_1920/Indigo%20Stardust%20Abaya%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/36/image_1920/Indigo%20Stardust%20Abaya?unique=47c5376"
    ],
    "productUrl": "/shop/sanne113-indigo-stardust-abaya-351",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2066/image_1920/Indigo%20Stardust%20Abaya%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDC3eRy9CSl0C9rybGJLh1zDT72MaZSVNQgRmce",
        "key": "457157623898750-43-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/36/image_1920/Indigo%20Stardust%20Abaya?unique=47c5376",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCs4h2QenVaC8wiqT7Xyz2AMbg3mJrvdEoPjuG",
        "key": "457157623898750-43-1"
      }
    ]
  },
  {
    "id": 44,
    "name": "Stardust Denim Skirt",
    "price": "3,405",
    "numericPrice": 3405,
    "images": [
      "https://sanne.com/web/image/product.product/2096/image_1920/Stardust%20Denim%20Skirt%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/49/image_1920/Stardust%20Denim%20Skirt?unique=b6a83bb"
    ],
    "productUrl": "/shop/sanne118-stardust-denim-skirt-356",
    "category": "women",
    "collections": [
      "New Arrivals",
      "Denim"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2096/image_1920/Stardust%20Denim%20Skirt%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCKdh0cQDRjWeM9hGapgH6sSEBKPy7uc2rk5C8",
        "key": "457157623899625-44-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/49/image_1920/Stardust%20Denim%20Skirt?unique=b6a83bb",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCo9BzH7LhFxDCPgQWMIaXUKS1Zjyrv4ifYOm2",
        "key": "457157623899625-44-1"
      }
    ]
  },
  {
    "id": 45,
    "name": "Suede Backless Vest",
    "price": "5,070",
    "numericPrice": 5070,
    "images": [
      "https://sanne.com/web/image/product.product/2564/image_1920/Suede%20Backless%20Vest%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/160/image_1920/Suede%20Backless%20Vest?unique=c400ed2"
    ],
    "productUrl": "/shop/sanne196-suede-backless-vest-434",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2564/image_1920/Suede%20Backless%20Vest%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCdY85B3ayUufT7FQ2pG0qNKcHrnCwxbS8kmvd",
        "key": "457157623900500-45-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/160/image_1920/Suede%20Backless%20Vest?unique=c400ed2",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCjW9TXA6JBib0szdjNnXlAKIyaRPMoFC2E14v",
        "key": "457157623900500-45-1"
      }
    ]
  },
  {
    "id": 46,
    "name": "Arizona Blue Stripe Shorts",
    "price": "1,900",
    "numericPrice": 1900,
    "images": [
      "https://sanne.com/web/image/product.product/2384/image_1920/Arizona%20Blue%20Stripe%20Shorts%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/115/image_1920/Arizona%20Blue%20Stripe%20Shorts?unique=9957be4"
    ],
    "productUrl": "/shop/sanne166-arizona-blue-stripe-shorts-404",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2384/image_1920/Arizona%20Blue%20Stripe%20Shorts%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCjoALCY6JBib0szdjNnXlAKIyaRPMoFC2E14v",
        "key": "457157623901333-46-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/115/image_1920/Arizona%20Blue%20Stripe%20Shorts?unique=9957be4",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCcle5XaSDvspglS02ObVxB7ncWorF8Xiq65aK",
        "key": "457157623901333-46-1"
      }
    ]
  },
  {
    "id": 47,
    "name": "Dusty Rose Shirt",
    "price": "3,090",
    "numericPrice": 3090,
    "images": [
      "https://sanne.com/web/image/product.product/2636/image_1920/Dusty%20Rose%20Shirt%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/6/image_1920/Dusty%20Rose%20Shirt?unique=c143181"
    ],
    "productUrl": "/shop/sanne208-dusty-rose-shirt-446",
    "category": "men",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2636/image_1920/Dusty%20Rose%20Shirt%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCGzOh2u4GN267MkFxYc0XhIaUj3WefDHQuLbJ",
        "key": "457157623902166-47-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/6/image_1920/Dusty%20Rose%20Shirt?unique=c143181",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCQxxlPExsiwlvNp4yXHj7nIgAbaWtFuYcZfdE",
        "key": "457157623902166-47-1"
      }
    ]
  },
  {
    "id": 48,
    "name": "Nutmeg Nouveau Pleated Trousers",
    "price": "3,400",
    "numericPrice": 3400,
    "images": [
      "https://sanne.com/web/image/product.product/2456/image_1920/Nutmeg%20Nouveau%20Pleated%20Trousers%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/135/image_1920/Nutmeg%20Nouveau%20Pleated%20Trousers?unique=b2ad755"
    ],
    "productUrl": "/shop/sanne178-nutmeg-nouveau-pleated-trousers-416",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2456/image_1920/Nutmeg%20Nouveau%20Pleated%20Trousers%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCyemCZxGVkGyqRMJnH8xjPAlKhb9Crd2cw4iS",
        "key": "457157623903083-48-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/135/image_1920/Nutmeg%20Nouveau%20Pleated%20Trousers?unique=b2ad755",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCvq29BlCKgv5Xdq48oPEUJ9u0Y3icCsDFnkxM",
        "key": "457157623903083-48-1"
      }
    ]
  },
  {
    "id": 49,
    "name": "Chocolate Cord Jacket",
    "price": "7,720",
    "numericPrice": 7720,
    "images": [
      "https://sanne.com/web/image/product.product/2486/image_1920/Chocolate%20Cord%20Jacket%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/143/image_1920/Chocolate%20Cord%20Jacket?unique=f0b5a31"
    ],
    "productUrl": "/shop/sanne183-chocolate-cord-jacket-421",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2486/image_1920/Chocolate%20Cord%20Jacket%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCWZZgVAwK6lwYvrnGj7ZILaOFqHAyuxfkmDRC",
        "key": "457157623904125-49-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/143/image_1920/Chocolate%20Cord%20Jacket?unique=f0b5a31",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCvqSe4zoKgv5Xdq48oPEUJ9u0Y3icCsDFnkxM",
        "key": "457157623904125-49-1"
      }
    ]
  },
  {
    "id": 50,
    "name": "Sunbeam Midi Dress",
    "price": "5,070",
    "numericPrice": 5070,
    "images": [
      "https://sanne.com/web/image/product.product/2390/image_1920/Sunbeam%20Midi%20Dress%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/119/image_1920/Sunbeam%20Midi%20Dress?unique=672a4ca"
    ],
    "productUrl": "/shop/sanne167-sunbeam-midi-dress-405",
    "category": "women",
    "collections": [
      "New Arrivals",
      "Evening Wear"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2390/image_1920/Sunbeam%20Midi%20Dress%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCedRM92EJvVGxDfEmrJghjwCQ9q67a2ARYXkn",
        "key": "457157623904958-50-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/119/image_1920/Sunbeam%20Midi%20Dress?unique=672a4ca",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCjFmjrU6JBib0szdjNnXlAKIyaRPMoFC2E14v",
        "key": "457157623904958-50-1"
      }
    ]
  },
  {
    "id": 51,
    "name": "Light Blue Nova Check Jeans",
    "price": "3,405",
    "numericPrice": 3405,
    "images": [
      "https://sanne.com/web/image/product.product/2259/image_1920/Light%20Blue%20Nova%20Check%20Jeans%20%28UK6%29?unique=6035869",
      "https://sanne.com/web/image/product.image/82/image_1920/Light%20Blue%20Nova%20Check%20Jeans?unique=06b0e6f"
    ],
    "productUrl": "/shop/sanne146-light-blue-nova-check-jeans-384",
    "category": "men",
    "collections": [
      "New Arrivals",
      "Denim"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2259/image_1920/Light%20Blue%20Nova%20Check%20Jeans%20%28UK6%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDC4WC4YWFGCSrcQAKbE9VomavRtP7Uw1DT6xdB",
        "key": "457157623905833-51-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/82/image_1920/Light%20Blue%20Nova%20Check%20Jeans?unique=06b0e6f",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCNyFlbdfCqDyvc4Tz58IgxEresOW9taQBXbZu",
        "key": "457157623905833-51-1"
      }
    ]
  },
  {
    "id": 52,
    "name": "Vanta Suede Jumpsuit",
    "price": "10,290",
    "numericPrice": 10290,
    "images": [
      "https://sanne.com/web/image/product.product/2342/image_1920/Vanta%20Suede%20Jumpsuit%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/106/image_1920/Vantablack%20Suede%20Leather%20Jumpsuit?unique=8d1acf2"
    ],
    "productUrl": "/shop/sanne159-vanta-suede-jumpsuit-397",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2342/image_1920/Vanta%20Suede%20Jumpsuit%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCWyy1fhwK6lwYvrnGj7ZILaOFqHAyuxfkmDRC",
        "key": "457157623906666-52-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/106/image_1920/Vantablack%20Suede%20Leather%20Jumpsuit?unique=8d1acf2",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCcFQClpSDvspglS02ObVxB7ncWorF8Xiq65aK",
        "key": "457157623906666-52-1"
      }
    ]
  },
  {
    "id": 53,
    "name": "Cascade Eclipse Blouse",
    "price": "4,750",
    "numericPrice": 4750,
    "images": [
      "https://sanne.com/web/image/product.product/2012/image_1920/Cascade%20Eclipse%20Blouse%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/19/image_1920/Cascade%20Eclipse%20Blouse?unique=340075b"
    ],
    "productUrl": "/shop/sanne104-cascade-eclipse-blouse-342",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2012/image_1920/Cascade%20Eclipse%20Blouse%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDC4WgShGFGCSrcQAKbE9VomavRtP7Uw1DT6xdB",
        "key": "457157623907541-53-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/19/image_1920/Cascade%20Eclipse%20Blouse?unique=340075b",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDC53pJ1D8m3v6TsZRuMln9gtICeNSWfbqEkoYz",
        "key": "457157623907541-53-1"
      }
    ]
  },
  {
    "id": 54,
    "name": "Sunkissed Siren Crepe Dress",
    "price": "3,525",
    "numericPrice": 3525,
    "images": [
      "https://sanne.com/web/image/product.product/2018/image_1920/Sunkissed%20Siren%20Crepe%20Dress%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/20/image_1920/Sunkissed%20Siren%20Crepe%20Dress?unique=e11daf5"
    ],
    "productUrl": "/shop/sanne105-sunkissed-siren-crepe-dress-343",
    "category": "women",
    "collections": [
      "New Arrivals",
      "Evening Wear"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2018/image_1920/Sunkissed%20Siren%20Crepe%20Dress%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCnTwRGSxgcL1TpAYlwXWZSn7FhatJiue2dsQE",
        "key": "457157623908375-54-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/20/image_1920/Sunkissed%20Siren%20Crepe%20Dress?unique=e11daf5",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCYq95k8tti4IDSpwnAFJcoKvLzqjRPVmQ0e1d",
        "key": "457157623908375-54-1"
      }
    ]
  },
  {
    "id": 55,
    "name": "Cream Tank Top",
    "price": "715",
    "numericPrice": 715,
    "images": [
      "https://sanne.com/web/image/product.product/2294/image_1920/Cream%20Tank%20Top%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/93/image_1920/Cream%20Tank%20Top?unique=6a2d590"
    ],
    "productUrl": "/shop/sanne151-cream-tank-top-389",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2294/image_1920/Cream%20Tank%20Top%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCyt682XGVkGyqRMJnH8xjPAlKhb9Crd2cw4iS",
        "key": "457157623909250-55-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/93/image_1920/Cream%20Tank%20Top?unique=6a2d590",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCtbLUjOTmQ973VsBWjgUrwPCF6Dn8XMNpvSIT",
        "key": "457157623909250-55-1"
      }
    ]
  },
  {
    "id": 56,
    "name": "Redwood Suede Vest",
    "price": "5,070",
    "numericPrice": 5070,
    "images": [
      "https://sanne.com/web/image/product.product/2576/image_1920/Redwood%20Suede%20Vest%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/118/image_1920/Redwood%20Suede%20Vest?unique=cddf904"
    ],
    "productUrl": "/shop/sanne198-redwood-suede-vest-436",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2576/image_1920/Redwood%20Suede%20Vest%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCXimOzCbbSmA2UkocaKnGWF8BLwrYM70zPxRp",
        "key": "457157623910125-56-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/118/image_1920/Redwood%20Suede%20Vest?unique=cddf904",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCOq2sUCyFakgoVs4LzJNB3hW0lqZ7DKGw9mEy",
        "key": "457157623910125-56-1"
      }
    ]
  },
  {
    "id": 57,
    "name": "Pleated Denim Trousers",
    "price": "2,930",
    "numericPrice": 2930,
    "images": [
      "https://sanne.com/web/image/product.product/2282/image_1920/Pleated%20Denim%20Trousers%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/88/image_1920/Pleat%20Perfect%20Denim%20Trousers?unique=8c7101e"
    ],
    "productUrl": "/shop/sanne149-pleated-denim-trousers-387",
    "category": "women",
    "collections": [
      "New Arrivals",
      "Denim"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2282/image_1920/Pleated%20Denim%20Trousers%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDChnxZCsyQtxz1wWX6LClbapKOMINP9s3RJv5d",
        "key": "457157623911000-57-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/88/image_1920/Pleat%20Perfect%20Denim%20Trousers?unique=8c7101e",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCJcHaYFpYMCOgdL0TcBXQZxeVuP7z5HnyvAm9",
        "key": "457157623911000-57-1"
      }
    ]
  },
  {
    "id": 58,
    "name": "Cropped Noir Jacket",
    "price": "7,125",
    "numericPrice": 7125,
    "images": [
      "https://sanne.com/web/image/product.product/2540/image_1920/Cropped%20Noir%20Jacket%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/117/image_1920/Comet%20Cropped%20Black%20Short%20Sleeve%20Jacket?unique=906606c"
    ],
    "productUrl": "/shop/sanne192-cropped-noir-jacket-430",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2540/image_1920/Cropped%20Noir%20Jacket%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCLeaPYmhQvfnEUgIcGX3H60zVkeTuiqdpBRh8",
        "key": "457157623911833-58-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/117/image_1920/Comet%20Cropped%20Black%20Short%20Sleeve%20Jacket?unique=906606c",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCKOE7gdDRjWeM9hGapgH6sSEBKPy7uc2rk5C8",
        "key": "457157623911833-58-1"
      }
    ]
  },
  {
    "id": 59,
    "name": "Buckle Strap Top",
    "price": "3,125",
    "numericPrice": 3125,
    "images": [
      "https://sanne.com/web/image/product.product/2366/image_1920/Buckle%20Strap%20Top%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/110/image_1920/Buckle%20Strap%20Top?unique=9431a83"
    ],
    "productUrl": "/shop/sanne163-buckle-strap-top-401",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2366/image_1920/Buckle%20Strap%20Top%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCeUl3NzJvVGxDfEmrJghjwCQ9q67a2ARYXkn8",
        "key": "457157623912708-59-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/110/image_1920/Buckle%20Strap%20Top?unique=9431a83",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDC8srVpFkuiVzghHv1ytQdb9XOIYPWnNUmr6Dk",
        "key": "457157623912708-59-1"
      }
    ]
  },
  {
    "id": 60,
    "name": "Noire Denim Trousers",
    "price": "2,930",
    "numericPrice": 2930,
    "images": [
      "https://sanne.com/web/image/product.product/2162/image_1920/Noire%20Denim%20Trousers%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/67/image_1920/Eclipse%20Noir%20Pleat%20Perfect%20Denim%20Trousers?unique=90363f3"
    ],
    "productUrl": "/shop/sanne129-noire-denim-trousers-367",
    "category": "women",
    "collections": [
      "New Arrivals",
      "Denim"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2162/image_1920/Noire%20Denim%20Trousers%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCLyCquChQvfnEUgIcGX3H60zVkeTuiqdpBRh8",
        "key": "457157623913541-60-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/67/image_1920/Eclipse%20Noir%20Pleat%20Perfect%20Denim%20Trousers?unique=90363f3",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCrXSIuQ9SQGq83NUXE1H7pLPwnuYlvxci2Kzt",
        "key": "457157623913541-60-1"
      }
    ]
  },
  {
    "id": 61,
    "name": "Umber Raincoat",
    "price": "4,515",
    "numericPrice": 4515,
    "images": [
      "https://sanne.com/web/image/product.product/2600/image_1920/Umber%20Raincoat%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/4/image_1920/Umber%20Raincoat?unique=b2626ad"
    ],
    "productUrl": "/shop/sanne202-umber-raincoat-440",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2600/image_1920/Umber%20Raincoat%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCV26DzviqtK7LUv2oQ1dSGu43fpJzAHkiReXw",
        "key": "457157623914416-61-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/4/image_1920/Umber%20Raincoat?unique=b2626ad",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCFbJdbu5FLuZj7Qe6YUxVyf8twCXmdTgaDhvN",
        "key": "457157623914416-61-1"
      }
    ]
  },
  {
    "id": 62,
    "name": "Chocolate Brown Tank Top",
    "price": "715",
    "numericPrice": 715,
    "images": [
      "https://sanne.com/web/image/product.product/2300/image_1920/Chocolate%20Brown%20Tank%20Top%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/95/image_1920/Chocolate%20Brown%20Tank%20Top?unique=111d51b"
    ],
    "productUrl": "/shop/sanne152-chocolate-brown-tank-top-390",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2300/image_1920/Chocolate%20Brown%20Tank%20Top%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCi82VuWYXYT7IdJuO64st3jNz52ZamDBRoKAq",
        "key": "457157623915250-62-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/95/image_1920/Chocolate%20Brown%20Tank%20Top?unique=111d51b",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDC7AXwew1mtXrxQ0vPlau6R15hy48kbsWCBFci",
        "key": "457157623915250-62-1"
      }
    ]
  },
  {
    "id": 63,
    "name": "Cherry Corset Trousers",
    "price": "3,920",
    "numericPrice": 3920,
    "images": [
      "https://sanne.com/web/image/product.product/2420/image_1920/Cherry%20Corset%20Trousers%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/127/image_1920/Cherry%20Synth%20Corset%20Trousers?unique=4cf9adc"
    ],
    "productUrl": "/shop/sanne172-cherry-corset-trousers-410",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2420/image_1920/Cherry%20Corset%20Trousers%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCt3bx6iTmQ973VsBWjgUrwPCF6Dn8XMNpvSIT",
        "key": "457157623916125-63-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/127/image_1920/Cherry%20Synth%20Corset%20Trousers?unique=4cf9adc",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCXf347kubbSmA2UkocaKnGWF8BLwrYM70zPxR",
        "key": "457157623916125-63-1"
      }
    ]
  },
  {
    "id": 64,
    "name": "Astro Grey Alpaca Coat",
    "price": "10,690",
    "numericPrice": 10690,
    "images": [
      "https://sanne.com/web/image/product.product/2246/image_1920/Astro%20Grey%20Alpaca%20Coat%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/78/image_1920/Asteroid%20Grey%20Baby%20Alpaca%20Coat?unique=064a543"
    ],
    "productUrl": "/shop/sanne143-astro-grey-alpaca-coat-381",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2246/image_1920/Astro%20Grey%20Alpaca%20Coat%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDC0YbEbBhVX4cMs27oUWvyrm3jgTzVDBGI6pnN",
        "key": "457157623916958-64-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/78/image_1920/Asteroid%20Grey%20Baby%20Alpaca%20Coat?unique=064a543",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCZehtbk2QPkwtDIENjdYWyR5fUa9evs0FVo6l",
        "key": "457157623916958-64-1"
      }
    ]
  },
  {
    "id": 65,
    "name": "Cashmere Beige Bomber",
    "price": "13,975",
    "numericPrice": 13975,
    "images": [
      "https://sanne.com/web/image/product.product/2624/image_1920/Cashmere%20Beige%20Bomber%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/9/image_1920/Sandstone%20Cashmere%20Bomber?unique=0002740"
    ],
    "productUrl": "/shop/sanne206-cashmere-beige-bomber-444",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2624/image_1920/Cashmere%20Beige%20Bomber%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDC5U4XcN8m3v6TsZRuMln9gtICeNSWfbqEkoYz",
        "key": "457157623917833-65-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/9/image_1920/Sandstone%20Cashmere%20Bomber?unique=0002740",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCd9BFdTdayUufT7FQ2pG0qNKcHrnCwxbS8kmv",
        "key": "457157623917833-65-1"
      }
    ]
  },
  {
    "id": 66,
    "name": "Lace-Up Cream Denim Flared Trousers",
    "price": "3,920",
    "numericPrice": 3920,
    "images": [
      "https://sanne.com/web/image/product.product/2144/image_1920/Lace-Up%20Cream%20Denim%20Flared%20Trousers%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/63/image_1920/Lace-Up%20Luna%20Cream%20Denim%20Flared%20Trousers?unique=83a562a"
    ],
    "productUrl": "/shop/sanne126-lace-up-cream-denim-flared-trousers-364",
    "category": "women",
    "collections": [
      "New Arrivals",
      "Denim"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2144/image_1920/Lace-Up%20Cream%20Denim%20Flared%20Trousers%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCZBhHXJj2QPkwtDIENjdYWyR5fUa9evs0FVo6",
        "key": "457157623918666-66-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/63/image_1920/Lace-Up%20Luna%20Cream%20Denim%20Flared%20Trousers?unique=83a562a",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDC0UxyQXVX4cMs27oUWvyrm3jgTzVDBGI6pnNR",
        "key": "457157623918666-66-1"
      }
    ]
  },
  {
    "id": 67,
    "name": "Orbit Chain Belt",
    "price": "2,930",
    "numericPrice": 2930,
    "images": [
      "https://sanne.com/web/image/product.product/2649/image_1920/%5BSANNE211%5D%20Orbit%20Chain%20Belt?unique=6035869",
      "https://sanne.com/web/image/product.image/242/image_1920/Orbit%20Chain%20Belt?unique=3d39695"
    ],
    "productUrl": "/shop/sanne211-orbit-chain-belt-449",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2649/image_1920/%5BSANNE211%5D%20Orbit%20Chain%20Belt?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCeVgPhtJvVGxDfEmrJghjwCQ9q67a2ARYXkn8",
        "key": "457157623919541-67-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/242/image_1920/Orbit%20Chain%20Belt?unique=3d39695",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCSLeRUq3J4LOcty0erQFDv8E6WVSoBGuPbYpI",
        "key": "457157623919541-67-1"
      }
    ]
  },
  {
    "id": 68,
    "name": "Ebone Fringe Trousers",
    "price": "3,920",
    "numericPrice": 3920,
    "images": [
      "https://sanne.com/web/image/product.product/2306/image_1920/Ebone%20Fringe%20Trousers%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/97/image_1920/Midnight%20Trails%20Fringe%20Trousers?unique=e94e0f3"
    ],
    "productUrl": "/shop/sanne153-ebone-fringe-trousers-391",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2306/image_1920/Ebone%20Fringe%20Trousers%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCbOXGxdNY74yEISs32Qmvcp5dzFTP9keqnxKr",
        "key": "457157623920625-68-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/97/image_1920/Midnight%20Trails%20Fringe%20Trousers?unique=e94e0f3",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDC3IcKWpl0C9rybGJLh1zDT72MaZSVNQgRmceq",
        "key": "457157623920625-68-1"
      }
    ]
  },
  {
    "id": 69,
    "name": "Chocolate Cord Backless Vest",
    "price": "4,355",
    "numericPrice": 4355,
    "images": [
      "https://sanne.com/web/image/product.product/2438/image_1920/Chocolate%20Cord%20Backless%20Vest%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/130/image_1920/Chocolate%20Cord%20Backless%20Vest?unique=bb0b06a"
    ],
    "productUrl": "/shop/sanne175-chocolate-cord-backless-vest-413",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2438/image_1920/Chocolate%20Cord%20Backless%20Vest%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCGIKlPi4GN267MkFxYc0XhIaUj3WefDHQuLbJ",
        "key": "457157623924666-69-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/130/image_1920/Chocolate%20Cord%20Backless%20Vest?unique=bb0b06a",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCZB5kAlo2QPkwtDIENjdYWyR5fUa9evs0FVo6",
        "key": "457157623924666-69-1"
      }
    ]
  },
  {
    "id": 70,
    "name": "Cognac Suede Dress",
    "price": "3,565",
    "numericPrice": 3565,
    "images": [
      "https://sanne.com/web/image/product.product/2504/image_1920/Cognac%20Suede%20Dress%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/147/image_1920/Cognac%20Suede%20Dress?unique=d7f257b"
    ],
    "productUrl": "/shop/sanne186-cognac-suede-dress-424",
    "category": "women",
    "collections": [
      "New Arrivals",
      "Evening Wear"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2504/image_1920/Cognac%20Suede%20Dress%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCFdPU795FLuZj7Qe6YUxVyf8twCXmdTgaDhvN",
        "key": "457157623925500-70-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/147/image_1920/Cognac%20Suede%20Dress?unique=d7f257b",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCb77ah7aNY74yEISs32Qmvcp5dzFTP9keqnxK",
        "key": "457157623925500-70-1"
      }
    ]
  },
  {
    "id": 71,
    "name": "Ebone Fringe Jacket",
    "price": "7,520",
    "numericPrice": 7520,
    "images": [
      "https://sanne.com/web/image/product.product/2318/image_1920/Ebone%20Fringe%20Jacket%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/100/image_1920/Midnight%20Trails%20Fringe%20Jacket?unique=23f9ffe"
    ],
    "productUrl": "/shop/sanne155-ebone-fringe-jacket-393",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2318/image_1920/Ebone%20Fringe%20Jacket%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCclZuz7kSDvspglS02ObVxB7ncWorF8Xiq65a",
        "key": "457157623926333-71-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/100/image_1920/Midnight%20Trails%20Fringe%20Jacket?unique=23f9ffe",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCO4sKkT3yFakgoVs4LzJNB3hW0lqZ7DKGw9mE",
        "key": "457157623926333-71-1"
      }
    ]
  },
  {
    "id": 72,
    "name": "Shadow Ridge Trousers",
    "price": "3,760",
    "numericPrice": 3760,
    "images": [
      "https://sanne.com/web/image/product.product/2330/image_1920/Shadow%20Ridge%20Trousers%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/104/image_1920/Shadow%20Ridge%20Trousers?unique=25d2eaf"
    ],
    "productUrl": "/shop/sanne157-shadow-ridge-trousers-395",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2330/image_1920/Shadow%20Ridge%20Trousers%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDChajyYVQtxz1wWX6LClbapKOMINP9s3RJv5d7",
        "key": "457157623927208-72-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/104/image_1920/Shadow%20Ridge%20Trousers?unique=25d2eaf",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCbPagpWNY74yEISs32Qmvcp5dzFTP9keqnxKr",
        "key": "457157623927208-72-1"
      }
    ]
  },
  {
    "id": 73,
    "name": "Ivory Pearl Corset Denim Trousers",
    "price": "3,920",
    "numericPrice": 3920,
    "images": [
      "https://sanne.com/web/image/product.product/2408/image_1920/Ivory%20Pearl%20Corset%20Denim%20Trousers%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/125/image_1920/Ivory%20Pearl%20Corset%20Denim%20Trousers?unique=10420cd"
    ],
    "productUrl": "/shop/sanne170-ivory-pearl-corset-denim-trousers-408",
    "category": "women",
    "collections": [
      "New Arrivals",
      "Denim"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2408/image_1920/Ivory%20Pearl%20Corset%20Denim%20Trousers%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCQmSpiVsiwlvNp4yXHj7nIgAbaWtFuYcZfdEM",
        "key": "457157623928041-73-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/125/image_1920/Ivory%20Pearl%20Corset%20Denim%20Trousers?unique=10420cd",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDC8MOQOUkuiVzghHv1ytQdb9XOIYPWnNUmr6Dk",
        "key": "457157623928041-73-1"
      }
    ]
  },
  {
    "id": 74,
    "name": "Nova Check Jeans",
    "price": "3,405",
    "numericPrice": 3405,
    "images": [
      "https://sanne.com/web/image/product.product/2042/image_1920/Nova%20Check%20Jeans%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/28/image_1920/Nova%20Check%20Jeans?unique=283a61a"
    ],
    "productUrl": "/shop/sanne109-nova-check-jeans-347",
    "category": "men",
    "collections": [
      "New Arrivals",
      "Denim"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2042/image_1920/Nova%20Check%20Jeans%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCo4OtXbLhFxDCPgQWMIaXUKS1Zjyrv4ifYOm2",
        "key": "457157623928916-74-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/28/image_1920/Nova%20Check%20Jeans?unique=283a61a",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCyzWviqGVkGyqRMJnH8xjPAlKhb9Crd2cw4iS",
        "key": "457157623928916-74-1"
      }
    ]
  },
  {
    "id": 75,
    "name": "Stellar Swirl Jeans",
    "price": "3,405",
    "numericPrice": 3405,
    "images": [
      "https://sanne.com/web/image/product.product/2036/image_1920/Stellar%20Swirl%20Jeans%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/27/image_1920/Stellar%20Swirl%20Jeans?unique=6d5d8ee"
    ],
    "productUrl": "/shop/sanne108-stellar-swirl-jeans-346",
    "category": "men",
    "collections": [
      "New Arrivals",
      "Denim"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2036/image_1920/Stellar%20Swirl%20Jeans%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCDDjYHtqBFZlbq04EY26iNG8jyheSWgvRUPLk",
        "key": "457157623929750-75-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/27/image_1920/Stellar%20Swirl%20Jeans?unique=6d5d8ee",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDC59qkT98m3v6TsZRuMln9gtICeNSWfbqEkoYz",
        "key": "457157623929750-75-1"
      }
    ]
  },
  {
    "id": 76,
    "name": "Stellar Sky Denim Blazer",
    "price": "7,520",
    "numericPrice": 7520,
    "images": [
      "https://sanne.com/web/image/product.product/2054/image_1920/Stellar%20Sky%20Denim%20Blazer%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/31/image_1920/Stellar%20Sky%20Denim%20Blazer?unique=5ad667f"
    ],
    "productUrl": "/shop/sanne111-stellar-sky-denim-blazer-349",
    "category": "women",
    "collections": [
      "New Arrivals",
      "Denim",
      "Workwear"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2054/image_1920/Stellar%20Sky%20Denim%20Blazer%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCQjhSkLsiwlvNp4yXHj7nIgAbaWtFuYcZfdEM",
        "key": "457157623930583-76-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/31/image_1920/Stellar%20Sky%20Denim%20Blazer?unique=5ad667f",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCDnmUUgqBFZlbq04EY26iNG8jyheSWgvRUPLk",
        "key": "457157623930583-76-1"
      }
    ]
  },
  {
    "id": 77,
    "name": "Canyon Corduroy Midi Skirt",
    "price": "3,445",
    "numericPrice": 3445,
    "images": [
      "https://sanne.com/web/image/product.product/2522/image_1920/Canyon%20Corduroy%20Midi%20Skirt%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/150/image_1920/Canyon%20Corduroy%20Midi%20Skirt?unique=64e49be"
    ],
    "productUrl": "/shop/sanne189-canyon-corduroy-midi-skirt-427",
    "category": "women",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2522/image_1920/Canyon%20Corduroy%20Midi%20Skirt%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCOiMLujyFakgoVs4LzJNB3hW0lqZ7DKGw9mEy",
        "key": "457157623931416-77-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/150/image_1920/Canyon%20Corduroy%20Midi%20Skirt?unique=64e49be",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDC7jhmGt1mtXrxQ0vPlau6R15hy48kbsWCBFci",
        "key": "457157623931416-77-1"
      }
    ]
  },
  {
    "id": 78,
    "name": "Canyon Corduroy Shirt",
    "price": "4,355",
    "numericPrice": 4355,
    "images": [
      "https://sanne.com/web/image/product.product/2528/image_1920/Canyon%20Corduroy%20Shirt%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/153/image_1920/Canyon%20Corduroy%20Shirt?unique=8cf695a"
    ],
    "productUrl": "/shop/sanne190-canyon-corduroy-shirt-428",
    "category": "men",
    "collections": [
      "New Arrivals"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2528/image_1920/Canyon%20Corduroy%20Shirt%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCgGEVCljvGPhyAKj28YxrCJbXZDqm53kiWsVM",
        "key": "457157623932458-78-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/153/image_1920/Canyon%20Corduroy%20Shirt?unique=8cf695a",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDC3eIY76jl0C9rybGJLh1zDT72MaZSVNQgRmce",
        "key": "457157623932458-78-1"
      }
    ]
  },
  {
    "id": 79,
    "name": "Chocolate Silk Shirt",
    "price": "4,075",
    "numericPrice": 4075,
    "images": [
      "https://sanne.com/web/image/product.product/2516/image_1920/Chocolate%20Silk%20Shirt%20%28UK16%29?unique=6035869",
      "https://sanne.com/web/image/product.image/148/image_1920/Chocolate%20Silk%20Sundown%20Shirt?unique=3442ca5"
    ],
    "productUrl": "/shop/sanne188-chocolate-silk-shirt-426",
    "category": "men",
    "collections": [
      "New Arrivals",
      "Luxury"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2516/image_1920/Chocolate%20Silk%20Shirt%20%28UK16%29?unique=6035869",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCkH5ckFoKSztsLv7VwIyP8MJYfDgdHl4pZnkC",
        "key": "457157623933375-79-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/148/image_1920/Chocolate%20Silk%20Sundown%20Shirt?unique=3442ca5",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCtS9ZlfTmQ973VsBWjgUrwPCF6Dn8XMNpvSIT",
        "key": "457157623933375-79-1"
      }
    ]
  },
  {
    "id": 80,
    "name": "Nomad Corset Dress",
    "price": "5,545",
    "numericPrice": 5545,
    "images": [
      "https://sanne.com/web/image/product.product/2642/image_1920/Nomad%20Corset%20Dress%20%28UK16%29?unique=98b6a74",
      "https://sanne.com/web/image/product.image/2/image_1920/Nomad%20Corset%20Dress?unique=df2a0ac"
    ],
    "productUrl": "/shop/sanne209-nomad-corset-dress-447",
    "category": "women",
    "collections": [
      "New Arrivals",
      "Evening Wear"
    ],
    "uploads": [
      {
        "originalUrl": "https://sanne.com/web/image/product.product/2642/image_1920/Nomad%20Corset%20Dress%20%28UK16%29?unique=98b6a74",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCph2Kx8drl4dc8VCkFzmTDYBAyG9X7UeORHtW",
        "key": "457157623934250-80-0"
      },
      {
        "originalUrl": "https://sanne.com/web/image/product.image/2/image_1920/Nomad%20Corset%20Dress?unique=df2a0ac",
        "ufsUrl": "https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCkvjr7toKSztsLv7VwIyP8MJYfDgdHl4pZnkC",
        "key": "457157623934250-80-1"
      }
    ]
  }
]
// Function to get all available collections
export function getAllCollections(): string[] {
  const collectionsSet = new Set<string>();
  
  products.forEach(product => {
    product.collections.forEach(collection => {
      collectionsSet.add(collection);
    });
  });
  
  return Array.from(collectionsSet);
}
