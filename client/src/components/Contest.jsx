import React, { useState } from 'react'
import FeedControlBar from './FeedControlBar'

const Contest = () => {
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [selectedSort, setSelectedSort] = useState("newest");
  return (
    <div>Contest
      <FeedControlBar
            filter={selectedFilter}
            sort={selectedSort}
            onFilterChange={setSelectedFilter}
            onSortChange={setSelectedSort}
          />
    </div>
  )
}

export default Contest