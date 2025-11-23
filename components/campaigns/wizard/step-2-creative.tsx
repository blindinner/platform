interface Step2CreativeProps {
  formData: {
    creativeFile: File | null
    creativePreview: string | null
  }
  updateFormData: (field: string, value: any) => void
}

export default function Step2Creative({ formData, updateFormData }: Step2CreativeProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      updateFormData('creativeFile', file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        updateFormData('creativePreview', reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemove = () => {
    updateFormData('creativeFile', null)
    updateFormData('creativePreview', null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Campaign Creative</h2>
        <p className="text-gray-600">
          Please upload here the specific creative you have created to share with the people that have bought a ticket for your event. The best performing creatives are the ones that are exclusive.
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Recommended:</strong> Use high-quality images (1200x630px or larger) for best results on social media
        </p>
      </div>

      {!formData.creativePreview ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
          <div className="text-gray-400 text-6xl mb-4">📸</div>
          <p className="text-gray-700 font-medium mb-2">
            Drag and drop your image here
          </p>
          <p className="text-gray-500 text-sm mb-4">
            or click to browse from your computer
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="creative-upload"
          />
          <label
            htmlFor="creative-upload"
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg cursor-pointer hover:bg-gray-800 transition-colors font-medium"
          >
            Choose Image
          </label>
          <p className="text-xs text-gray-500 mt-4">
            Supported formats: JPG, PNG, GIF (Max size: 5MB)
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={formData.creativePreview}
              alt="Creative preview"
              className="w-full h-auto rounded-lg border-2 border-gray-200 shadow-sm"
            />
            <button
              onClick={handleRemove}
              className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
              title="Remove image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✓</span>
              <div>
                <p className="text-sm font-medium text-green-800">Image uploaded successfully!</p>
                <p className="text-sm text-green-700 mt-1">
                  File: {formData.creativeFile?.name}
                  {formData.creativeFile && ` (${(formData.creativeFile.size / 1024).toFixed(1)} KB)`}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => document.getElementById('creative-upload')?.click()}
            className="w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Replace Image
          </button>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="creative-upload"
          />
        </div>
      )}
    </div>
  )
}
