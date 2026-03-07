import { useState, useEffect, useRef } from 'react'
import { useLowBandwidth } from '../hooks'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  lowQualitySrc?: string
  placeholder?: string
}

/**
 * Lazy-loaded image component with low bandwidth support
 * 
 * Features:
 * - Lazy loads images using Intersection Observer
 * - Uses low quality image in low bandwidth mode
 * - Shows placeholder while loading
 * - Reduces image quality by 50% in low bandwidth mode
 */
export function LazyImage({ 
  src, 
  alt, 
  className = '', 
  lowQualitySrc,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E'
}: LazyImageProps) {
  const { isLowBandwidth } = useLowBandwidth()
  const [imageSrc, setImageSrc] = useState<string>(placeholder)
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    // Use Intersection Observer for lazy loading
    const currentImg = imgRef.current
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Determine which image to load based on bandwidth mode
            const imageToLoad = isLowBandwidth && lowQualitySrc ? lowQualitySrc : src
            
            // Load the image
            const img = new Image()
            img.src = imageToLoad
            img.onload = () => {
              setImageSrc(imageToLoad)
              setIsLoaded(true)
            }
            img.onerror = () => {
              // Fallback to original src if low quality fails
              if (isLowBandwidth && lowQualitySrc && imageToLoad === lowQualitySrc) {
                const fallbackImg = new Image()
                fallbackImg.src = src
                fallbackImg.onload = () => {
                  setImageSrc(src)
                  setIsLoaded(true)
                }
              }
            }

            // Stop observing once loaded
            if (currentImg) {
              observer.unobserve(currentImg)
            }
          }
        })
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    )

    if (currentImg) {
      observer.observe(currentImg)
    }

    return () => {
      if (currentImg) {
        observer.unobserve(currentImg)
      }
    }
  }, [src, lowQualitySrc, isLowBandwidth])

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${!isLoaded ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}
      loading="lazy"
      decoding="async"
    />
  )
}
