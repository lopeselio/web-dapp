require "csv"

namespace :users do
  task airdrop_level_one: :environment do
    puts "Sending to ##{User.count} users"

    CSV.open("airdrop_results.csv", "w") do |csv|
      csv << ["user_id", "username", "wallet_id", "success"]
      User.where.not(wallet_id: nil).pluck(:id).each do |user_id|
        user = User.find(user_id)
        if user.wallet_id.length == 42
          service = Web3::MintUserNFT.new(season: 1)
          result = service.call(user: user)
          if result.present?
            user.update!(user_nft_minted: true, user_nft_address: result)
          end
          csv << [user.id, user.username, user.wallet_id, result.present?]
        end
        csv << [user.id, user.username, user.wallet_id, "Bad wallet"]
      end
    end
  end
end