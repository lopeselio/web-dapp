Rails.application.routes.draw do
  # Admin area
  constraints Clearance::Constraints::SignedIn.new { |user| user.admin? } do
    root to: "feeds#show", as: :admin_root

    get "/admin", to: "admin/dashboards#show"

    namespace :admin do
      resources :dashboards, only: [:show]
      resources :investors
      resources :talent do
        resources :coins, only: [:show, :edit, :update], module: "talent"
        resources :career_goals, only: [:show, :edit, :update], module: "talent"
        resources :rewards, module: "talent"
        resources :tags, module: "talent"
      end
      resources :wait_list
      resources :users
    end
  end

  # end Admin

  # Auth - Clearance generated routes
  resources :passwords, controller: "clearance/passwords", only: [:create, :new]
  resource :session, controller: "sessions", only: [:create]

  resources :users, only: [:create, :index] do
    resource :password,
      controller: "clearance/passwords",
      only: [:edit, :update]
  end

  get "/sign_in" => "sessions#new", :as => "sign_in"
  delete "/sign_out" => "sessions#destroy", :as => "sign_out"

  # end Auth

  # Business - require log-in
  constraints Clearance::Constraints::SignedIn.new do
    root to: "feeds#show", as: :user_root

    # file uploads
    unless Rails.env.test?
      mount Shrine.uppy_s3_multipart(:cache) => "/s3/multipart"
    end

    # Talent pages & search
    get "/talent/active", to: "talent/searches#active"
    get "/talent/upcoming", to: "talent/searches#upcoming"
    resources :talent, only: [:index, :show, :update] do
      resources :career_goals, only: [:create, :update], module: "talent"
      resources :rewards, only: [:create, :update], module: "talent"
    end

    # Portfolio
    resources :portfolio, only: [:index]

    # Chat
    resources :messages, only: [:index, :show, :create]
    mount ActionCable.server => "/cable"

    resources :settings, only: [:index]

    # Feeds
    resource :feed, only: [:show]
    resources :follows, only: [:index, :create]
    delete "follows", to: "follows#destroy"

    resources :posts, only: [:show, :create, :destroy] do
      resources :comments, only: [:index, :create, :destroy], module: "posts"
    end

    # Swap
    resource :swap, only: [:show]
    resources :transactions, only: [:create]
  end

  resources :wait_list, only: [:create, :index]

  root to: "pages#home", as: :root

  match "*unmatched", to: "application#route_not_found", via: :all
end
